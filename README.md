# Multi-Vendor E-commerce Platform SASS

Welcome to our Multi-Vendor E-commerce Platform! This project allows anyone to launch their own online store and sell products with ease. Built with modern web technologies, it offers a seamless experience for both vendors and customers.

## Project Structure

This project is divided into two main parts:

1. **API and Admin Dashboard** - Located in the `api-admin` folder
2. **Front Store** - Located in the `front-store` folder

Each part has its own set of dependencies and environment variables.

## Features

- **Multi-vendor Support**: Allow multiple sellers to register and manage their own stores within the platform.
- **Product Management**: Vendors can easily add, edit, and delete products, including images, descriptions, and pricing.
- **Order Management**: Comprehensive system for tracking and managing orders from placement to fulfillment.
- **User Authentication**: Secure login and registration using Clerk for both vendors and customers.
- **Search and Filtering**: Advanced search functionality with filters to help customers find products quickly.
- **Shopping Cart**: A robust shopping cart system that supports products from multiple vendors.
- **Payment Integration**: Secure payment processing with Stripe integration.
- **Responsive Design**: Mobile-friendly interface that works seamlessly across devices.
- **Reviews and Ratings**: Allow customers to leave feedback and ratings for products.
- **Analytics Dashboard**: Provide vendors with insights into their sales and performance.
- **Customizable Storefronts**: Vendors can personalize their store's appearance within the platform.
- **Email Notifications**: Automated email notifications using Google SMTP.
- **Image Management**: Cloud-based image storage and manipulation with Cloudinary.

## Tech Stack

- **Frontend and Backend**:
  - [Next.js](https://nextjs.org/) - React framework for building full-stack web applications
  - [React](https://reactjs.org/) - JavaScript library for building user interfaces
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development

- **Database**:
  - [MongoDB](https://www.mongodb.com/) - NoSQL database for flexible, scalable data storage

- **Authentication**:
  - [Clerk](https://clerk.dev/) - Complete user management and authentication solution

- **State Management**:
  - [Redux Toolkit](https://redux-toolkit.js.org/) - Toolset for efficient Redux development

- **API Routes**:
  - Next.js API Routes - Built-in API route support for backend functionality

- **Payment Processing**:
  - [Stripe](https://stripe.com/) - Online payment processing for internet businesses

- **Image Storage and Optimization**:
  - [Cloudinary](https://cloudinary.com/) - Cloud-based image and video management platform

- **Email Service**:
  - Google SMTP - For sending automated emails

## Getting Started

Follow these steps to set up the project locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/E-Store.git
   cd E-Store
   ```

2. **Install dependencies for both parts of the project**

   ```bash
   cd api-admin
   npm install
   cd ../front-store
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in both the `api-admin` and `front-store` directories.

   For `api-admin/.env`:

   ```
   # NEXT URL
   NEXT_PUBLIC_SERVER_URL=http://localhost:3001
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_CLIENT_URL=http://localhost:3000

   # GOOGLE ACCOUNT SEND EMAIL 
   NEXT_PUBLIC_GOOGLE_MY_EMAIL=<put your email here>
   GOOGLE_PASSWORD_APP=<put your email app password application here>

   # DB 
   MONGODB_URI=<put your mongo db string>

   # Stripe integration 
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<put stripe public key>
   STRIPE_SECRET_KEY=<put stripe security>

   # Clerk integration 
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk public key>
   CLERK_SECRET_KEY=<clerk security key>
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   # Cloudinary integration 
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
   NEXT_PUBLIC_CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   CLOUDINARY_URL=
   NEXT_PUBLIC_CLOUDINARY_PRESET_NAME=
   ```

   For `front-store/.env`:

   ```
   # NEXT URL
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3001

   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=put your public key here
   CLERK_SECRET_KEY=put your secret key here

   # Stripe integration 
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=put your public key here
   STRIPE_SECRET_KEY=put your secret key here
   ```

4. **Run the development servers**

   In separate terminal windows:

   For Front Store:
   ```bash
   cd front-store
   npm run dev
   ```

   For API and Admin Dashboard:
   ```bash
   cd api-admin
   npm run dev
   ```
 

5. **Open your browser**

   - Navigate to `http://localhost:3000` to see the Front Store.
   - Navigate to `http://localhost:3001` to see the API and Admin Dashboard.
