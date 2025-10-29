import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Slash } from "lucide-react";
//import Link from "next/link";
import React from "react";

export default function MainContent({ showContent }: { showContent: string }) {
  return (
    <section className="flex-1 mb-10 gap-4 items-start h-screen ">
    <section className="mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Gettings started</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </section>
    <section className="mb-12">
    {showContent === "introduction" && (
      <div className="flex flex-col space-y-8 text-slate-600 text-balance">
        <h3>Introduction</h3>
        <h5>What is E-City?</h5>
        <p className="text-xl/8">
          E-City is a Multi Vendor eCommerce platform built to empower entrepreneurs and small businesses in Rwanda and other developing countries to launch and manage their own online marketplace. <br />
          This app is <strong>fully customisable</strong>, <strong>well documented</strong> for non-developers who want to create their own platform without coding <br />
          and developers who want to enhance or adapt the platform with new features.
        </p>

        <h5>What is a Multi Vendor platform for?</h5>
        <p className="text-xl/8">
          A multi vendor ecommerce store is a marketplace where multiple sellers can list and sell their products or services. Compared to a single vendor store, this model promotes local commerce and creates job opportunities by involving many actors in the ecosystem.
        </p>

        <h5>Difference between Multi Vendor and Single Vendor</h5>
        <p className="text-xl/8">
          Unlike a single vendor store with just a seller and customer, a multi-vendor platform like E-City involves three key roles: the administrator (owner of the app), the vendors (sellers), and the customers (buyers).
        </p>
        <p className="text-xl/8">
          The admin manages the platform operations, vendor subscriptions, payments, and overall monitoring.
        </p>
        <p className="text-xl/8">
          Customers can shop from various sellers, supporting local businesses while enjoying a broad selection of products.
        </p>
        <p className="text-xl/8">
          Vendors are individual sellers or small businesses that use the platform to reach a wider audience without building their own infrastructure.
        </p>
        <p className="text-xl/8">
          Multi-vendor marketplaces offer a sustainable business model with shared growth opportunities.
        </p>

        <h5>Why E-City is Unique in Rwanda</h5>
        <p className="text-xl/8">
          E-City is proudly the <strong>first multi-vendor SaaS ecommerce solution in Rwanda</strong>. It is built specifically for the local market, taking into consideration infrastructure, payment methods, and the needs of small entrepreneurs who want to digitize their businesses.
        </p>

        <h5>Key Benefits of Building a Multi Vendor Marketplace Platform</h5>
        <ul>
          <li className="text-xl/8 underline text-primary-500 capitalize">For a buyer</li>
          <li className="text-xl/8">
            Buyers in Rwanda and similar economies can access a wider variety of local products in one place, saving time and money.
          </li>
          <li className="text-xl/8">
            E-City provides convenience by enabling users to compare products and make informed decisions without leaving the platform.
          </li>
        </ul>

        <ul>
          <li className="text-xl/8 underline text-primary-500">For a vendor or seller</li>
          <li className="text-xl/8">
            Vendors can reach new markets without the costs of setting up their own stores. E-City provides tools for inventory, analytics, and customer engagement.
          </li>
        </ul>

        <ul>
          <li className="text-xl/8 underline text-primary-500">For an owner</li>
          <li className="text-xl/8">
            E-City owners benefit from data-driven insights, vendor subscription models, and scalable revenue streams tailored for emerging markets.
          </li>
          <li className="text-xl/8">
            It also provides an opportunity to digitize and formalize informal business practices across Rwanda, creating a more connected economy.
          </li>
        </ul>
      </div>
    )}

    {showContent === "features" && (
      <div className="flex flex-col space-y-8">
        <h4>Key features of E-City</h4>
        <p className="text-xl/8 text-balance">
          E-City is a modern and powerful digital marketplace platform made for Rwanda and the broader African tech ecosystem. Whether you are building a platform for selling fashion, electronics, digital content or local services, E-City is designed to accommodate the unique needs of this market.
        </p>

        <ul className="flex flex-col space-y-4">
          <li><h5 className="text-primary-700">SaaS Enabled</h5></li>
          <li className="text-xl/8 text-balance">
            E-City is a Software as a Service (SaaS) platform that allows the app owner to monetize vendor subscriptions while providing scalable infrastructure.
          </li>

          <li><h5 className="text-primary-700">Vendor Management</h5></li>
          <li className="text-xl/8 text-balance">
            Vendors can manage their shop, products, customer inquiries, and view analytics all in one place. This helps sellers streamline operations and grow their business.
          </li>

          <li><h5 className="text-primary-700">Order Management</h5></li>
          <li className="text-xl/8 text-balance">
            E-City handles the entire order lifecycle—from product listing to delivery—allowing both sellers and buyers to track every step efficiently.
          </li>

          <li><h5 className="text-primary-700">Marketplace Analytics</h5></li>
          <li className="text-xl/8 text-balance">
            With real-time dashboards, sellers and admins get insights into sales trends, product performance, and user behavior to make better decisions.
          </li>

          <li><h5 className="text-primary-700">Payment Management</h5></li>
          <li className="text-xl/8 text-balance">
            E-City supports integrations with mobile money platforms widely used in Rwanda. Vendors can request payouts directly to services like MTN Mobile Money or Airtel Money.
          </li>
        </ul>
      </div>
    )}

    {showContent === "mobile money" && (
      <div className="flex flex-col space-y-8 text-xl/8">
        <h4>Mobile Money Integration</h4>
        <p>E-City is deeply integrated with mobile money services like MTN MoMo and Airtel Money, making it accessible and practical for users across Rwanda. Vendors can easily cash out their earnings, and customers can pay using trusted local methods.</p>
      </div>
    )}

    {showContent === "logisitics" && (
      <div className="flex flex-col space-y-8 text-xl/8">
        <h4>Logistics & Delivery</h4>
        <p>E-City supports partnerships with local delivery services and offers APIs or manual setup for vendors to manage logistics within cities or across provinces.</p>
      </div>
    )}

    {showContent === "pricing" && (
      <div className="flex flex-col space-y-8 text-xl/8">
        <h4>Subscription & Pricing</h4>
        <p>Vendors can choose from flexible subscription plans starting from a free trial to premium tiers. Each tier offers different benefits including more product listings, marketing tools, and analytics.</p>
      </div>
    )}

    {showContent === "support" && (
      <div className="flex flex-col space-y-8 text-xl/8">
        <h4>Support & Help Center</h4>
        <p>If you have questions or need help, our support team is available via WhatsApp, email, or direct call. We also maintain a searchable knowledge base for common issues.</p>
      </div>
    )}

    {showContent === "success-stories" && (
      <div className="flex flex-col space-y-8 text-xl/8">
        <h4>Vendor Success Stories</h4>
        <p>Learn how Rwandan entrepreneurs are growing their businesses with E-City. From tailors to tech shops, E-City is creating real economic impact in the community.</p>
      </div>
    )}

    {showContent === "security" && (
      <div className="flex flex-col space-y-8 text-xl/8">
        <h4>Security & Data Privacy</h4>
        <p>We take your data seriously. E-City follows best practices to secure user data and complies with Rwandan digital commerce regulations and international data protection norms.</p>
      </div>
    )}
    </section>
  </section>
);
}
