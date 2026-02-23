/**
 * AI Document Verification Service
 * Handles OCR, data extraction, fraud detection, and document validation
 */

import {
  DocumentType,
  VerificationResult,
  VerificationFlag,
  DocumentUpload,
  Address,
} from '../types';

// OCR Provider Configuration
interface OcrConfig {
  provider: 'tesseract' | 'aws-textract' | 'google-vision';
  apiKey?: string;
  region?: string;
}

// Document field extraction templates
interface DocumentTemplate {
  documentType: DocumentType;
  requiredFields: string[];
  optionalFields: string[];
  validationRules: ValidationRule[];
}

interface ValidationRule {
  field: string;
  type: 'date' | 'string' | 'number' | 'regex';
  validator: (value: unknown) => boolean;
  errorMessage: string;
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class DocumentVerificationService {
  private ocrConfig: OcrConfig;
  private fraudDetectionEnabled: boolean;
  private externalVerificationEnabled: boolean;

  constructor(config: {
    ocrConfig: OcrConfig;
    fraudDetectionEnabled?: boolean;
    externalVerificationEnabled?: boolean;
  }) {
    this.ocrConfig = config.ocrConfig;
    this.fraudDetectionEnabled = config.fraudDetectionEnabled ?? true;
    this.externalVerificationEnabled = config.externalVerificationEnabled ?? false;
  }

  /**
   * Main entry point: Process a document through the full verification pipeline
   */
  async verifyDocument(
    document: DocumentUpload,
    contextData?: {
      applicantName?: string;
      applicantAddress?: Address;
      vehicleInfo?: {
        make?: string;
        model?: string;
        year?: number;
        licensePlate?: string;
        vin?: string;
      };
    }
  ): Promise<VerificationResult> {
    const startTime = Date.now();
    const flags: VerificationFlag[] = [];

    try {
      // Step 1: Quality Check
      const qualityCheck = await this.checkImageQuality(document.fileUrl);
      if (!qualityCheck.passed) {
        flags.push(...qualityCheck.flags);
      }

      // Step 2: OCR Extraction
      const ocrResult = await this.performOCR(document.fileUrl, document.documentType);

      // Step 3: Data Validation
      const validationResult = this.validateExtractedData(
        document.documentType,
        ocrResult.extractedFields,
        contextData
      );
      flags.push(...validationResult.flags);

      // Step 4: Fraud Detection
      let authenticityScore = 85; // Base score
      if (this.fraudDetectionEnabled) {
        const fraudResult = await this.detectFraud(document);
        authenticityScore = fraudResult.authenticityScore;
        if (fraudResult.flags.length > 0) {
          flags.push(...fraudResult.flags);
        }
      }

      // Step 5: External Verification (if enabled)
      if (this.externalVerificationEnabled) {
        const externalResult = await this.verifyWithExternalSource(
          document.documentType,
          ocrResult.extractedFields
        );
        if (!externalResult.verified) {
          flags.push('invalid_document_type');
        }
      }

      // Calculate confidence score
      const confidence = this.calculateConfidence(
        qualityCheck.score,
        ocrResult.confidence,
        validationResult.validFields,
        authenticityScore,
        flags.length
      );

      const processingTimeMs = Date.now() - startTime;

      return {
        documentType: document.documentType,
        confidence,
        extractedData: ocrResult.extractedFields,
        flags,
        authenticityScore,
        ocrText: ocrResult.rawText,
        processedAt: new Date(),
        processingTimeMs,
      };
    } catch (error) {
      console.error('Document verification failed:', error);
      throw new DocumentVerificationError(
        'Verification failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Step 1: Check image quality (resolution, blur, lighting)
   */
  private async checkImageQuality(fileUrl: string): Promise<{
    passed: boolean;
    score: number;
    flags: VerificationFlag[];
  }> {
    const flags: VerificationFlag[] = [];
    
    // This would use image processing libraries in production
    // For now, simulating the quality check
    const simulatedScore = Math.random() * 30 + 70; // 70-100
    
    // Simulate quality issues
    if (simulatedScore < 75) {
      flags.push('blurry_image');
    }
    if (simulatedScore < 80) {
      flags.push('poor_lighting');
    }
    if (simulatedScore < 85) {
      flags.push('document_cropped');
    }

    return {
      passed: simulatedScore >= 75,
      score: simulatedScore,
      flags,
    };
  }

  /**
   * Step 2: Perform OCR based on configured provider
   */
  private async performOCR(
    fileUrl: string,
    documentType: DocumentType
  ): Promise<{
    rawText: string;
    extractedFields: Record<string, string | Date | number | undefined>;
    confidence: number;
  }> {
    // In production, this would call the actual OCR provider
    // AWS Textract, Google Vision, or Tesseract
    
    const rawText = await this.callOCRProvider(fileUrl);
    const extractedFields = this.parseDocumentFields(documentType, rawText);
    
    // Calculate extraction confidence
    const confidence = this.calculateExtractionConfidence(documentType, extractedFields);

    return {
      rawText,
      extractedFields,
      confidence,
    };
  }

  private async callOCRProvider(fileUrl: string): Promise<string> {
    // Simulated OCR call
    // In production:
    // if (this.ocrConfig.provider === 'aws-textract') {
    //   return await this.callAWS Textract(fileUrl);
    // } else if (this.ocrConfig.provider === 'google-vision') {
    //   return await this.callGoogleVision(fileUrl);
    // }
    
    // Simulated raw OCR text
    return `DRIVER LICENSE
    DL 123456789
    DOE
    JOHN
    123 MAIN ST
    PARADISE, CA 95969
    DOB: 01/15/1990
    EXP: 01/15/2027
    CLASS: C
    RESTRICTIONS: NONE`;
  }

  private parseDocumentFields(
    documentType: DocumentType,
    rawText: string
  ): Record<string, string | Date | number | undefined> {
    const fields: Record<string, string | Date | number | undefined> = {};
    const lines = rawText.split('\n').map(l => l.trim());
    
    switch (documentType) {
      case 'drivers_license_front':
      case 'drivers_license_back':
        fields.name = this.extractName(lines);
        fields.licenseNumber = this.extractLicenseNumber(lines);
        fields.dateOfBirth = this.extractDate(lines, ['DOB', 'Date of Birth', 'Birth Date']);
        fields.expirationDate = this.extractDate(lines, ['EXP', 'Expires', 'Expiration']);
        fields.address = this.extractAddress(lines);
        fields.licenseClass = this.extractField(lines, ['CLASS', 'Class', 'CLS']);
        fields.restrictions = this.extractField(lines, ['RESTRICTIONS', 'Rest', 'RSTR']);
        break;
        
      case 'auto_insurance':
        fields.insuranceCompany = this.extractInsuranceCompany(lines);
        fields.policyNumber = this.extractField(lines, ['Policy', 'POLICY', 'POL #']);
        fields.effectiveDate = this.extractDate(lines, ['Effective', 'EFF']);
        fields.expirationDate = this.extractDate(lines, ['Expiration', 'EXP']);
        fields.coverageAmount = this.extractCoverageAmount(lines);
        fields.vehicleInfo = this.extractVehicleInfo(lines);
        fields.hasCommercialCoverage = rawText.toLowerCase().includes('commercial') || 
                                       rawText.toLowerCase().includes('rideshare');
        break;
        
      case 'vehicle_registration':
        fields.vin = this.extractVIN(lines);
        fields.licensePlate = this.extractField(lines, ['PLATE', 'Plate', 'LP']);
        fields.make = this.extractField(lines, ['MAKE', 'Make']);
        fields.model = this.extractField(lines, ['MODEL', 'Model']);
        fields.year = this.extractYear(lines);
        fields.expirationDate = this.extractDate(lines, ['EXP', 'Expires', 'Expiration']);
        fields.registeredOwner = this.extractName(lines);
        break;
        
      case 'business_license':
        fields.businessName = this.extractBusinessName(lines);
        fields.licenseNumber = this.extractField(lines, ['License', 'LICENSE #', 'BL']);
        fields.expirationDate = this.extractDate(lines, ['EXP', 'Expires', 'Expiration']);
        fields.businessType = this.extractField(lines, ['Type', 'Business Type']);
        fields.address = this.extractAddress(lines);
        break;
        
      case 'health_permit':
        fields.permitNumber = this.extractField(lines, ['Permit', 'PERMIT #']);
        fields.facilityName = this.extractBusinessName(lines);
        fields.expirationDate = this.extractDate(lines, ['EXP', 'Expires', 'Expiration']);
        fields.inspectionDate = this.extractDate(lines, ['Inspection', 'INSPECTED']);
        break;
        
      default:
        // Generic extraction
        fields.rawText = rawText;
    }
    
    return fields;
  }

  // Helper extraction methods
  private extractName(lines: string[]): string | undefined {
    // Look for patterns like "DOE\nJOHN" or "John Doe"
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Check for surname followed by given name pattern
      if (i < lines.length - 1 && line.length > 1 && lines[i + 1].length > 1) {
        const potentialName = `${lines[i + 1]} ${line}`;
        if (this.isValidName(potentialName)) {
          return potentialName;
        }
      }
      // Check for "Name: John Doe" pattern
      if (line.toLowerCase().includes('name')) {
        const match = line.match(/name[:\s]+([a-z\s]+)/i);
        if (match) return match[1].trim();
      }
    }
    return undefined;
  }

  private extractLicenseNumber(lines: string[]): string | undefined {
    for (const line of lines) {
      // Match patterns like "DL 123456789" or "License: ABC123456"
      const match = line.match(/(?:DL|License|Lic|#)[:\s]*([A-Z0-9]{6,})/i);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractDate(
    lines: string[],
    keywords: string[]
  ): Date | undefined {
    for (const line of lines) {
      for (const keyword of keywords) {
        if (line.toUpperCase().includes(keyword.toUpperCase())) {
          // Match dates like 01/15/2027, 01-15-2027, Jan 15 2027
          const match = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/) ||
                       line.match(/([A-Za-z]{3,}\s+\d{1,2},?\s+\d{4})/);
          if (match) {
            const parsed = new Date(match[1]);
            if (!isNaN(parsed.getTime())) {
              return parsed;
            }
          }
        }
      }
    }
    return undefined;
  }

  private extractAddress(lines: string[]): string | undefined {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Look for street address pattern
      if (/^\d+\s+/.test(line) && i < lines.length - 1) {
        const cityStateLine = lines[i + 1];
        if (cityStateLine.includes(',') && /\d{5}/.test(cityStateLine)) {
          return `${line}, ${cityStateLine}`;
        }
      }
    }
    return undefined;
  }

  private extractField(lines: string[], keywords: string[]): string | undefined {
    for (const line of lines) {
      for (const keyword of keywords) {
        if (line.toUpperCase().includes(keyword.toUpperCase())) {
          const parts = line.split(/[:\s]+/);
          const keywordIndex = parts.findIndex(p => 
            p.toUpperCase().includes(keyword.toUpperCase())
          );
          if (keywordIndex !== -1 && keywordIndex < parts.length - 1) {
            return parts.slice(keywordIndex + 1).join(' ').trim();
          }
        }
      }
    }
    return undefined;
  }

  private extractInsuranceCompany(lines: string[]): string | undefined {
    const knownCompanies = ['State Farm', 'Geico', 'Progressive', 'Allstate', 
                           'Farmers', 'Liberty Mutual', 'Nationwide', 'AAA'];
    const text = lines.join(' ');
    for (const company of knownCompanies) {
      if (text.toLowerCase().includes(company.toLowerCase())) {
        return company;
      }
    }
    return undefined;
  }

  private extractCoverageAmount(lines: string[]): number | undefined {
    const text = lines.join(' ');
    const match = text.match(/\$?([\d,]+(?:\.\d{2})?)\s*(?:million|M)/i);
    if (match) {
      return parseFloat(match[1].replace(/,/g, '')) * 1000000;
    }
    return undefined;
  }

  private extractVIN(lines: string[]): string | undefined {
    const text = lines.join(' ');
    // VIN is 17 alphanumeric characters (excluding I, O, Q)
    const match = text.match(/[A-HJ-NPR-Z0-9]{17}/);
    return match ? match[0] : undefined;
  }

  private extractYear(lines: string[]): number | undefined {
    const text = lines.join(' ');
    const match = text.match(/\b(19|20)\d{2}\b/);
    return match ? parseInt(match[0]) : undefined;
  }

  private extractVehicleInfo(lines: string[]): string | undefined {
    // Extract year, make, model combination
    const text = lines.join(' ');
    const match = text.match(/\b(20\d{2}|19\d{2})\s+([A-Za-z]+)\s+([A-Za-z0-9\s]+)/);
    return match ? match[0] : undefined;
  }

  private extractBusinessName(lines: string[]): string | undefined {
    // Look for business name patterns
    for (const line of lines) {
      if (line.length > 3 && !line.match(/^\d+$/)) {
        // Skip lines that look like license numbers or addresses
        if (!line.match(/^\d+\s/) && !line.match(/^[A-Z0-9]+$/)) {
          return line;
        }
      }
    }
    return undefined;
  }

  private isValidName(name: string): boolean {
    return /^[A-Za-z\s'-]{2,50}$/.test(name.trim());
  }

  /**
   * Step 3: Validate extracted data
   */
  private validateExtractedData(
    documentType: DocumentType,
    fields: Record<string, string | Date | number | undefined>,
    contextData?: {
      applicantName?: string;
      applicantAddress?: Address;
      vehicleInfo?: {
        make?: string;
        model?: string;
        year?: number;
        licensePlate?: string;
        vin?: string;
      };
    }
  ): {
    validFields: number;
    flags: VerificationFlag[];
  } {
    const flags: VerificationFlag[] = [];
    let validFields = 0;

    // Check expiration dates
    if (fields.expirationDate) {
      const expDate = new Date(fields.expirationDate);
      if (expDate < new Date()) {
        flags.push('expired_document');
      } else if (expDate < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) {
        flags.push('expiration_soon');
      }
    }

    // Validate name matches
    if (fields.name && contextData?.applicantName) {
      const extractedName = (fields.name as string).toLowerCase().replace(/\s+/g, '');
      const contextName = contextData.applicantName.toLowerCase().replace(/\s+/g, '');
      if (!extractedName.includes(contextName) && !contextName.includes(extractedName)) {
        flags.push('name_mismatch');
      }
    }

    // Validate dates are reasonable
    if (fields.dateOfBirth) {
      const dob = new Date(fields.dateOfBirth);
      const age = this.calculateAge(dob);
      if (age < 18) {
        flags.push('date_invalid');
      }
    }

    // Validate vehicle info matches
    if (documentType === 'vehicle_registration' && contextData?.vehicleInfo) {
      if (fields.vin && contextData.vehicleInfo.vin) {
        if ((fields.vin as string).toUpperCase() !== contextData.vehicleInfo.vin.toUpperCase()) {
          flags.push('name_mismatch'); // VIN mismatch
        }
      }
    }

    // Count valid fields
    validFields = Object.values(fields).filter(v => v !== undefined).length;

    return { validFields, flags };
  }

  private calculateAge(dob: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Step 4: Fraud Detection
   */
  private async detectFraud(document: DocumentUpload): Promise<{
    authenticityScore: number;
    flags: VerificationFlag[];
  }> {
    const flags: VerificationFlag[] = [];
    let score = 85; // Base score

    // Check for editing artifacts
    const editingCheck = await this.checkEditingArtifacts(document.fileUrl);
    if (editingCheck.hasArtifacts) {
      score -= 20;
      flags.push('suspicious_editing');
    }

    // Check document template against known fakes
    const templateCheck = await this.checkDocumentTemplate(document);
    if (templateCheck.isKnownFake) {
      score -= 40;
      flags.push('template_match_known_fake');
    }

    // Check EXIF data for inconsistencies
    const exifCheck = await this.checkEXIFData(document);
    if (exifCheck.suspicious) {
      score -= 10;
    }

    return {
      authenticityScore: Math.max(0, score),
      flags,
    };
  }

  private async checkEditingArtifacts(fileUrl: string): Promise<{
    hasArtifacts: boolean;
  }> {
    // In production, this would analyze image for:
    // - JPEG artifacts around edited regions
    // - Inconsistent noise patterns
    // - Cloning detection
    // - Metadata inconsistencies
    
    // Simulated check
    return { hasArtifacts: false };
  }

  private async checkDocumentTemplate(document: DocumentUpload): Promise<{
    isKnownFake: boolean;
  }> {
    // In production, compare document layout against database of known fake templates
    // Check fonts, spacing, colors, hologram presence, etc.
    
    // Simulated check
    return { isKnownFake: false };
  }

  private async checkEXIFData(document: DocumentUpload): Promise<{
    suspicious: boolean;
  }> {
    // Check for missing EXIF data (screenshots have less EXIF)
    // Check timestamp consistency
    // Check device info
    
    return { suspicious: false };
  }

  /**
   * Step 5: External Verification
   */
  private async verifyWithExternalSource(
    documentType: DocumentType,
    fields: Record<string, string | Date | number | undefined>
  ): Promise<{
    verified: boolean;
    source?: string;
  }> {
    // This would integrate with external APIs:
    // - DMV API for driver's licenses
    // - Insurance carrier APIs
    // - City/county business license databases
    // - Health department databases
    
    // For now, return simulated verification
    return { verified: true };
  }

  // ============================================================================
  // SCORING AND CONFIDENCE
  // ============================================================================

  private calculateConfidence(
    qualityScore: number,
    ocrConfidence: number,
    validFields: number,
    authenticityScore: number,
    flagCount: number
  ): number {
    const baseScore = (qualityScore + ocrConfidence + authenticityScore) / 3;
    const fieldBonus = Math.min(validFields * 5, 20); // Up to 20 bonus points
    const flagPenalty = flagCount * 10; // 10 points per flag
    
    return Math.max(0, Math.min(100, baseScore + fieldBonus - flagPenalty));
  }

  private calculateExtractionConfidence(
    documentType: DocumentType,
    fields: Record<string, string | Date | number | undefined>
  ): number {
    const templates: Record<DocumentType, string[]> = {
      drivers_license_front: ['name', 'licenseNumber', 'dateOfBirth', 'expirationDate'],
      drivers_license_back: ['address', 'restrictions'],
      auto_insurance: ['insuranceCompany', 'policyNumber', 'effectiveDate', 'expirationDate'],
      vehicle_registration: ['vin', 'licensePlate', 'make', 'model', 'year', 'expirationDate'],
      business_license: ['businessName', 'licenseNumber', 'expirationDate', 'address'],
      health_permit: ['permitNumber', 'facilityName', 'expirationDate'],
      sellers_permit: ['permitNumber', 'businessName'],
      liability_insurance: ['insuranceCompany', 'policyNumber', 'coverageAmount'],
      workers_comp: ['policyNumber', 'insuranceCompany'],
      menu_pdf: [],
      bank_statement: ['accountHolderName'],
      w9_form: ['name', 'ein'],
      profile_photo: [],
      pickup_area_photo: [],
    };

    const requiredFields = templates[documentType] || [];
    if (requiredFields.length === 0) return 90;

    const foundFields = requiredFields.filter(f => fields[f] !== undefined);
    return Math.round((foundFields.length / requiredFields.length) * 100);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Batch process multiple documents
   */
  async batchVerify(
    documents: DocumentUpload[],
    contextData?: Parameters<typeof this.verifyDocument>[1]
  ): Promise<VerificationResult[]> {
    const results: VerificationResult[] = [];
    
    for (const document of documents) {
      try {
        const result = await this.verifyDocument(document, contextData);
        results.push(result);
      } catch (error) {
        console.error(`Failed to verify document ${document.id}:`, error);
        results.push({
          documentType: document.documentType,
          confidence: 0,
          extractedData: {},
          flags: ['invalid_document_type'],
          authenticityScore: 0,
          processedAt: new Date(),
          processingTimeMs: 0,
        });
      }
    }
    
    return results;
  }

  /**
   * Compare profile photo with license photo for face match
   */
  async verifyFaceMatch(
    profilePhotoUrl: string,
    licensePhotoUrl: string
  ): Promise<{
    matches: boolean;
    confidence: number;
  }> {
    // In production, use AWS Rekognition, Azure Face API, or similar
    // to compare faces between profile photo and license photo
    
    // Simulated face match
    return {
      matches: true,
      confidence: 92,
    };
  }
}

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

export class DocumentVerificationError extends Error {
  constructor(
    message: string,
    public readonly details: string,
    public readonly code: string = 'VERIFICATION_FAILED'
  ) {
    super(message);
    this.name = 'DocumentVerificationError';
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createDocumentVerificationService(config?: {
  ocrProvider?: 'tesseract' | 'aws-textract' | 'google-vision';
  apiKey?: string;
  fraudDetection?: boolean;
}): DocumentVerificationService {
  return new DocumentVerificationService({
    ocrConfig: {
      provider: config?.ocrProvider || 'aws-textract',
      apiKey: config?.apiKey,
    },
    fraudDetectionEnabled: config?.fraudDetection ?? true,
  });
}
