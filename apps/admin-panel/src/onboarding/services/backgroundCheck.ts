/**
 * Background Check Service
 * Integration with Checkr (or similar providers)
 */

import { DriverApplication, BackgroundCheckResult } from '../types';

// ============================================================================
// Configuration
// ============================================================================

interface BackgroundCheckConfig {
  provider: 'checkr' | 'sterling' | 'goodhire';
  apiKey: string;
  apiUrl?: string;
}

// ============================================================================
// Main Service
// ============================================================================

export class BackgroundCheckService {
  private config: BackgroundCheckConfig;

  constructor(config: BackgroundCheckConfig) {
    this.config = config;
  }

  /**
   * Initiate a background check for a driver applicant
   */
  async initiateCheck(application: DriverApplication): Promise<BackgroundCheckResult> {
    // In production, call Checkr API:
    // POST https://api.checkr.com/v1/candidates
    // POST https://api.checkr.com/v1/reports
    
    // For now, simulate the response
    const reportId = `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      provider: this.config.provider,
      reportId,
      status: 'pending',
      initiatedAt: new Date(),
      criminalRecords: [],
      drivingRecord: {
        licenseStatus: 'valid',
        licenseClass: 'C',
        violations: [],
        totalViolations: 0,
        movingViolations2Years: 0,
      },
      sexOffenderCheck: 'clear',
      autoRejectFlags: [],
    };
  }

  /**
   * Check the status of a background check
   */
  async checkStatus(reportId: string): Promise<Partial<BackgroundCheckResult>> {
    // In production, call Checkr API:
    // GET https://api.checkr.com/v1/reports/{reportId}
    
    // Simulate status update
    return {
      status: 'clear',
      completedAt: new Date(),
    };
  }

  /**
   * Process webhook from background check provider
   */
  async processWebhook(payload: any): Promise<BackgroundCheckResult> {
    // Handle Checkr webhooks
    // https://docs.checkr.com/#section/Webhooks
    
    const result = await this.parseReportData(payload);
    return result;
  }

  /**
   * Parse raw report data into our format
   */
  private async parseReportData(data: any): Promise<BackgroundCheckResult> {
    const criminalRecords = this.parseCriminalRecords(data.criminal_records || []);
    const drivingRecord = this.parseDrivingRecord(data.motor_vehicle_report || {});
    const autoRejectFlags = this.determineAutoRejectFlags(criminalRecords, drivingRecord);
    
    return {
      provider: this.config.provider,
      reportId: data.id,
      status: autoRejectFlags.length > 0 ? 'consider' : 'clear',
      initiatedAt: new Date(data.created_at),
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      criminalRecords,
      drivingRecord,
      sexOffenderCheck: data.sex_offender_search?.status === 'clear' ? 'clear' : 'hit',
      autoRejectFlags,
      reportUrl: data.document_url,
    };
  }

  private parseCriminalRecords(records: any[]): any[] {
    return records.map(record => ({
      offense: record.charge || record.offense,
      offenseDate: new Date(record.offense_date),
      convictionDate: record.disposition_date ? new Date(record.disposition_date) : undefined,
      disposition: record.disposition || 'Unknown',
      severity: this.mapSeverity(record.charge_type),
      violent: this.isViolentOffense(record.charge || ''),
      duiRelated: this.isDUI(record.charge || ''),
    }));
  }

  private parseDrivingRecord(report: any): any {
    const violations = (report.records || []).map((v: any) => ({
      date: new Date(v.violation_date || v.incident_date),
      violation: v.violation || v.description,
      points: v.points || 0,
      moving: this.isMovingViolation(v.violation || ''),
      reckless: this.isReckless(v.violation || ''),
      dui: this.isDUI(v.violation || ''),
    }));

    const movingViolations2Years = violations.filter((v: any) => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      return v.moving && v.date > twoYearsAgo;
    }).length;

    return {
      licenseStatus: this.mapLicenseStatus(report.status),
      licenseClass: report.license_class || 'C',
      violations,
      totalViolations: violations.length,
      movingViolations2Years,
    };
  }

  private determineAutoRejectFlags(criminalRecords: any[], drivingRecord: any): string[] {
    const flags: string[] = [];
    const sevenYearsAgo = new Date();
    sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

    // Check for DUI in last 7 years
    const recentDUI = criminalRecords.some(r => 
      r.duiRelated && r.offenseDate > sevenYearsAgo
    ) || drivingRecord.violations.some((v: any) => 
      v.dui && v.date > sevenYearsAgo
    );
    if (recentDUI) flags.push('dui_7_years');

    // Check for violent felonies
    const violentFelony = criminalRecords.some(r => 
      r.violent && r.severity === 'felony' && r.offenseDate > sevenYearsAgo
    );
    if (violentFelony) flags.push('violent_felony');

    // Check for excessive violations
    if (drivingRecord.movingViolations2Years > 3) {
      flags.push('excessive_violations');
    }

    // Check license status
    if (drivingRecord.licenseStatus !== 'valid') {
      flags.push('suspended_license');
    }

    // Check for reckless driving
    const reckless = drivingRecord.violations.some((v: any) => v.reckless);
    if (reckless) flags.push('reckless_driving');

    return flags;
  }

  // Helper methods
  private mapSeverity(chargeType: string): 'misdemeanor' | 'felony' | 'infraction' {
    const type = (chargeType || '').toLowerCase();
    if (type.includes('felony')) return 'felony';
    if (type.includes('misdemeanor')) return 'misdemeanor';
    return 'infraction';
  }

  private isViolentOffense(charge: string): boolean {
    const violentKeywords = ['assault', 'battery', 'robbery', 'homicide', 'manslaughter', 'kidnapping'];
    return violentKeywords.some(k => charge.toLowerCase().includes(k));
  }

  private isDUI(charge: string): boolean {
    const duiKeywords = ['dui', 'dwi', 'driving under influence', 'driving while intoxicated'];
    return duiKeywords.some(k => charge.toLowerCase().includes(k));
  }

  private isReckless(charge: string): boolean {
    return charge.toLowerCase().includes('reckless');
  }

  private isMovingViolation(violation: string): boolean {
    // Non-moving violations typically don't affect insurance/risk
    const nonMoving = ['parking', 'equipment', 'registration', 'inspection'];
    return !nonMoving.some(k => violation.toLowerCase().includes(k));
  }

  private mapLicenseStatus(status: string): 'valid' | 'suspended' | 'expired' | 'revoked' {
    const s = (status || '').toLowerCase();
    if (s.includes('suspend')) return 'suspended';
    if (s.includes('expire')) return 'expired';
    if (s.includes('revoke')) return 'revoked';
    return 'valid';
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createBackgroundCheckService(config: BackgroundCheckConfig): BackgroundCheckService {
  return new BackgroundCheckService(config);
}

// ============================================================================
// Mock Data Generator (for testing)
// ============================================================================

export function generateMockBackgroundCheck(
  status: 'clear' | 'consider' | 'has_issues' = 'clear'
): BackgroundCheckResult {
  const base: BackgroundCheckResult = {
    provider: 'checkr',
    reportId: `rpt_mock_${Date.now()}`,
    status: 'clear',
    initiatedAt: new Date(),
    completedAt: new Date(),
    criminalRecords: [],
    drivingRecord: {
      licenseStatus: 'valid',
      licenseClass: 'C',
      violations: [],
      totalViolations: 0,
      movingViolations2Years: 0,
    },
    sexOffenderCheck: 'clear',
    autoRejectFlags: [],
  };

  if (status === 'has_issues') {
    base.drivingRecord.violations = [
      {
        date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        violation: 'Speeding 15-20 mph over',
        points: 2,
        moving: true,
        reckless: false,
        dui: false,
      },
    ];
    base.drivingRecord.totalViolations = 1;
    base.drivingRecord.movingViolations2Years = 1;
  }

  return base;
}
