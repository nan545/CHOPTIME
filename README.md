# ChopTime Ghana - Production Food Delivery Platform

ChopTime Ghana is a full-stack, on-demand food delivery web application built for the Ghanaian market (Accra, Kumasi, Tema, and surrounding cities). The platform connects **Customers**, **Restaurants**, **Delivery Riders**, and **Administrators** in a unified ecosystem with a persistent database, real authentication, live order status synchronization, and Paystack / Mobile Money payment architecture.

---

## 1. System Architecture & Features

### 🛒 Customer Experience
- **Cuisine Discovery**: Browse authentic local Ghanaian restaurants (Buka Restaurant Osu, Auntie Muni Waakye Labone, Papaye Fast Food Spintex, Starbites East Legon, Asanka Local Madina, Vic Baboo's Kumasi).
- **Customizable Meals**: Select proteins (Grilled Tilapia, Chicken, Goat Meat, Fried Snapper, Wele), spice level, and authentic Ghanaian add-ons (extra fried plantain dodo, boiled eggs with pepper, black shito jars, gari foto, extra banku/fufu).
- **Cart & Calculation**: Real-time server-side verified cart totals in Ghana Cedis (GH₵), delivery fee by neighborhood distance, platform service fee, and promo discount.
- **Ghana Address Support**: Saved addresses (Home, Office, Residence) with Ghana Post GPS digital address validation (e.g. `GA-030-4921`).
- **Paystack & Mobile Money Integration**: Native support for MTN Mobile Money, Telecel Cash (Vodafone), AT Money, and Visa/Mastercard with transaction reference verification.
- **Live Real-Time Tracking**: Real-time Firestore synchronization of the 9-stage order lifecycle with an interactive animated route map.
- **Verified Reviews**: Post-delivery rating and review system restricted to customers who completed the order.

### 🍳 Restaurant Kitchen Portal
- **Live Kitchen Queue**: Real-time incoming orders with status progression (`CONFIRMED` → `PREPARING` → `READY_FOR_PICKUP`).
- **Menu Management**: Create, edit, and toggle food availability (In Stock / Sold Out) with instant updates across customer apps.
- **Daily Analytics**: Total daily revenue in GH₵, active kitchen tickets, and completed orders.

### 🏍️ Rider Dispatch Application
- **Online / Offline Toggle**: Riders can go online to receive nearby delivery requests in Accra or Kumasi.
- **Delivery Workflow**: Step-by-step progress tracking: Accept Order → Arrived at Kitchen → Picked Up → Out for Delivery → Delivered.
- **Turn-by-Turn GPS**: Direct Google Maps routing between restaurant pickup and customer delivery gate.
- **Earnings Tracker**: Real-time calculation of daily delivery commissions in Cedis.

### 🛡️ Platform Governance (Admin Dashboard)
- **Platform Analytics**: Gross Merchandise Value (GMV in GH₵), total orders processed, registered vendors, and active riders.
- **Vendor & Rider Approvals**: Verify restaurants and approve motorcycle rider licenses.
- **Live Orders Stream**: Full visibility over all platform orders and payment transactions.
- **Coupon System**: Create and manage promotional discount codes (e.g., `AKWAABA20`, `CHOP15`, `FREEDEL`).

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Motion, Lucide Icons, Canvas Confetti.
- **Routing**: React Router (`react-router-dom`).
- **Database & Realtime**: Firebase Cloud Firestore with live snapshot listeners (`onSnapshot`) and Attribute-Based Access Control (`firestore.rules`).
- **Authentication**: Firebase Authentication (Google Sign-In + persistent role profiles).
- **Payments Architecture**: Dual support for **Hubtel Merchant Gateway** (Direct Ghana Mobile Money USSD prompt) and **Paystack Ghana** (Mobile Money + Visa/Mastercard Cards). Both processors have 0 GH₵ setup and monthly maintenance fees.
- **Maps & Navigation**: Google Maps Directions & Ghana Post GPS addresses.

---

## 3. Database Schema

The database model is defined in `firebase-blueprint.json` and secured by `firestore.rules`:
- `/users/{userId}`: User profiles with role flags (`customer`, `restaurant`, `rider`, `admin`).
- `/restaurants/{restaurantId}`: Restaurant profile, opening hours, delivery fees, and ratings.
- `/foodItems/{foodItemId}`: Menu dishes, options, add-ons, and pricing in Cedis.
- `/orders/{orderId}`: Real orders with items, pricing breakdown, timeline events, and payment references.
- `/reviews/{reviewId}`: Customer reviews linked to completed orders.
- `/coupons/{couponId}`: Discount promo codes with validation constraints.
- `/notifications/{notificationId}`: Real-time user alert records.

---

## 4. Test Roles & Quick Switcher

For evaluation, use the quick role switcher in the header bar:
- **Customer**: Kwame Mensah (`kwame.mensah@example.com`)
- **Restaurant**: Buka Restaurant Osu (`manager@bukarestaurant.com.gh`)
- **Rider**: Kofi Boateng (`kofi.boateng.rider@example.com`)
- **Admin**: Platform Administrator (`nharnharquophi19@gmail.com`)

---

## 5. Development & Production Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Lint & TypeScript check
npm run lint

# Production build
npm run build
```
