# ProStore Mobile

A modern full stack ecommerce mobile application built with **React Native, Expo and TypeScript**. ProStore provides a complete mobile shopping experience including product discovery, authentication, cart management, wishlist, checkout, Paystack payments and order tracking.

## Overview

ProStore Mobile is the mobile client for the ProStore ecommerce platform. It connects to a production backend API to provide customers with a seamless shopping experience on Android.

The application was built with a focus on:

* Clean and responsive mobile UI
* Simple ecommerce workflows
* Secure authentication
* Persistent customer data
* Payment processing
* Global light and dark themes
* Production ready Android deployment

## Features

### Shopping

* Product browsing
* Product details
* Featured products
* Product stock validation
* Currency selection
* USD and NGN pricing support

### Cart

* Add products to cart
* Increase and decrease quantities
* Stock limit enforcement
* Remove individual products
* Clear entire cart
* Automatic subtotal calculation
* Checkout flow

### Authentication

* Customer registration
* Customer login
* Secure authentication
* Persistent authentication state
* Password visibility toggle
* Guest browsing
* Sign out

### Wishlist

* Add products to wishlist
* Remove products from wishlist
* Wishlist persistence
* Wishlist integration with product browsing

### Checkout & Payments

* Customer address management
* Checkout validation
* Stock verification
* Order creation
* Paystack payment initialization
* Paystack payment verification
* Payment success handling

### Orders

* Order history
* Order details
* Order status
* Product and quantity information
* Order success screen
* Automatic cart clearing after successful order

### Theme

* Global light mode
* Global dark mode
* Sun/moon theme toggle
* Persistent theme preference
* Theme applied across navigation and screens

### Production

* Android APK build
* Production Android App Bundle
* EAS managed builds
* Android signing credentials
* Production API integration

## Tech Stack

### Mobile

* **React Native**
* **Expo SDK 54**
* **TypeScript**
* **Expo Router**
* **React Navigation**
* **React Native Reanimated**
* **React Native Gesture Handler**
* **React Native Safe Area Context**
* **Expo Vector Icons**
* **Expo Secure Store**
* **AsyncStorage**
* **React Native WebView**

### Backend

* **Next.js**
* **API Routes**
* **Prisma**
* **PostgreSQL**

### Payments

* **Paystack**

### Build & Deployment

* **EAS Build**
* **Android APK**
* **Android App Bundle (.aab)**

## Project Structure

```text
prostore-mobile/
│
├── app/
│   ├── (tabs)/
│   │   ├── cart.tsx
│   │   ├── index.tsx
│   │   ├── profile.tsx
│   │   ├── shop.tsx
│   │   ├── _layout.tsx
│   │   └── product/
│   │       └── [id].tsx
│   │
│   ├── checkout.tsx
│   ├── login.tsx
│   ├── modal.tsx
│   ├── order/
│   │   └── [id].tsx
│   ├── order-success.tsx
│   ├── orders.tsx
│   ├── payment.tsx
│   ├── register.tsx
│   ├── wishlist.tsx
│   └── _layout.tsx
│
├── components/
│   └── providers/
│       ├── auth-provider.tsx
│       ├── cart-provider.tsx
│       ├── currency-provider.tsx
│       └── theme-provider.tsx
│
├── lib/
│   └── api.ts
│
├── assets/
│   └── images/
│
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

Make sure you have:

* Node.js installed
* npm installed
* Expo CLI / EAS CLI
* Android device or emulator

### Installation

Clone the repository:

```bash
git clone https://github.com/mikeisresilient/prostore-mobile.git
```

Navigate into the project:

```bash
cd prostore-mobile
```

Install dependencies:

```bash
npm install
```

### Start Development Server

```bash
npx expo start
```

You can then open the application using an Android emulator or compatible Expo development environment.

## API Configuration

The mobile application communicates with the ProStore production backend through a centralized API configuration:

```text
https://prostore-ecommerce.vercel.app
```

API requests are accessed through:

```text
lib/api.ts
```

This keeps the backend URL centralized rather than hardcoding it throughout the application.

## Build

### Preview APK

The project uses EAS Build for Android builds.

```bash
eas build --platform android --profile preview
```

The preview profile is configured to generate an installable APK.

### Production Build

Create the Google Play compatible Android App Bundle:

```bash
eas build --platform android --profile production
```

## Production

The application has been successfully built as both:

* Android APK (scroll to the bottom for link)
* Production Android App Bundle (`.aab`)

The production build uses EAS managed Android signing credentials.

## Design

ProStore follows a minimalist ecommerce design system built around:

* Black and white visual hierarchy
* Rounded cards and controls
* Clear typography
* Spacious layouts
* Responsive mobile screens
* Light and dark themes
* Simple navigation

## Authentication & Security

Authentication state is handled through a dedicated `AuthProvider`.

Sensitive authentication data is designed to use secure device storage through **Expo Secure Store**, while non sensitive application preferences such as the selected theme are persisted with **AsyncStorage**.

## Payment Flow

The payment process follows this general flow:

```text
Customer
   │
   ▼
Checkout
   │
   ▼
Create Order
   │
   ▼
Initialize Paystack Payment
   │
   ▼
Paystack Checkout
   │
   ▼
Payment Verification
   │
   ▼
Successful Payment
   │
   ▼
Order Confirmation
   │
   ▼
Cart Cleared
```

## Theme Architecture

The application uses a centralized `ThemeProvider`.

Instead of managing colors separately inside every screen, screens consume the global theme:

```tsx
const { colors, isDark } = useTheme();
```

The theme supports:

```text
Light
Dark
System
```

The selected theme is persisted locally so the preference remains after restarting the application.

## Android

The application is configured with:

```text
Application Name: ProStore
Package: com.prostore.mobile
Version: 1.0.0
Initial versionCode: 1
Production versionCode: 2
```

## Links

**GitHub**

[ProStore Mobile Repository](https://github.com/mikeisresilient/prostore-mobile)

**Expo Project**

[ProStore Mobile on Expo](https://expo.dev/accounts/mikeisresilient/projects/prostore-mobile)

## 👨Developer

Built by **Michael Ege**

Full Stack Web, Blockchain & Mobile Developer

---

## 📄 License

This project is currently private/proprietary unless otherwise specified by the repository owner.
