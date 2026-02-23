# City Delivery LLC - Competitor Price Database

## How It Works

For each restaurant, you'll input:
1. Menu items (name, description)
2. **Your price** (after 10% discount)
3. **DoorDash price** (what they actually charge)
4. System calculates exact savings per item

## Example: Carmelita's Mexican Grill

| Item | Your Price | DoorDash Price | You Save |
|------|------------|----------------|----------|
| Burrito Bowl | $10.79 | $12.99 | $2.20 |
| Street Tacos (3) | $8.99 | $10.99 | $2.00 |
| Chips & Guac | $6.29 | $7.99 | $1.70 |
| Large Horchata | $3.59 | $4.49 | $0.90 |

**Cart Example:**
- Customer orders: Burrito Bowl + Tacos + Drink
- Your total: $23.37
- DoorDash total: $28.47
- **Exact savings: $5.10**

---

## Data Format

```typescript
interface MenuItemWithComparison {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  // Your pricing (after 10% discount)
  ourPrice: number;
  // Competitor pricing
  doorDashPrice: number;
  uberEatsPrice?: number; // optional
  // Auto-calculated
  savingsVsDoorDash: number;
  savingsPercentage: number;
}
```

---

## Send Me Your Menu Data

**Format I need:**

For each restaurant, send:
1. Restaurant name
2. Menu items (name + description)
3. **Your price** (what you'll charge after 10% discount)
4. **DoorDash price** (screenshot or amount they charge)

**Example email/message:**

```
Restaurant: Carmelita's Mexican Grill

Menu:
1. Burrito Bowl - Rice, beans, protein, toppings
   - Your price: $10.79
   - DoorDash: $12.99

2. Street Tacos (3) - Corn tortillas, meat, onions, cilantro
   - Your price: $8.99
   - DoorDash: $10.99

3. Large Horchata
   - Your price: $3.59
   - DoorDash: $4.49
```

---

## How to Get DoorDash Prices

1. Open DoorDash app/website
2. Search for the restaurant
3. Look at menu prices (don't order)
4. Screenshot or write down prices
5. Send to me

**Tip:** Prices may vary by location, so check Paradise, CA specifically.

---

## I'll Build

Once you send me the data, I'll:
1. Create the menu in the database
2. Add exact DoorDash prices
3. Wire up the comparison calculator
4. Show exact savings in the cart

**Example cart display:**
```
Your Order:
- Burrito Bowl              $10.79
- Street Tacos (3)          $8.99
- Large Horchata            $3.59

Us:                        $23.37
DoorDash:                  $28.47
You save:                  $5.10
```

---

## For Launch

**Minimum needed:** 3-5 restaurants with full menus
- Carmelita's (priority #1)
- Paradise Cafe
- Italian Cottage
- 1-2 more

**Time to input:** ~30 min per restaurant

Send me the first one and I'll show you how it looks!
