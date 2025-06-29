
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AcknowledgedBy from '@/components/public/AcknowledgedBy';
import OneStopPlatform from '@/components/public/OneStopPlatform';
import FeaturedTrainers from '@/components/public/FeaturedTrainers';
import FeaturedGyms from '@/components/public/FeaturedGyms';
import MobileAppShowcase from '@/components/public/MobileAppShowcase';
import HowItWorks from '@/components/public/HowItWorks';
import SuccessStories from '@/components/public/SuccessStories';
import TrustSignals from '@/components/public/TrustSignals';
import LocationCoverage from '@/components/public/LocationCoverage';
import JoinAsTrainer from '@/components/public/JoinAsTrainer';
import ListYourGym from '@/components/public/ListYourGym';
import CTASection from '@/components/public/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "HealthyThako",
    "alternateName": ["HealthyThako Bangladesh", "Healthy Thako"],
    "description": "Bangladesh's First One-Stop Fitness Platform connecting clients with certified personal trainers and premium gyms. Find trainer and gym in Bangladesh easily.",
    "url": "https://healthythako.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://healthythako.com/lovable-uploads/9ad7ef1d-d16c-4b00-bc75-a2f5243041f7.png",
      "width": 200,
      "height": 200
    },
    "image": "https://healthythako.com/lovable-uploads/bc34458a-b624-4196-8177-de4588a059e9.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+880-1700000000",
      "contactType": "customer service",
      "areaServed": "BD",
      "availableLanguage": ["Bengali", "English"]
    },
    "areaServed": {
      "@type": "Country",
      "name": "Bangladesh"
    },
    "serviceType": [
      "Personal Training", 
      "Fitness Coaching", 
      "Yoga Instruction", 
      "Weight Loss Training", 
      "Strength Training", 
      "Gym Membership",
      "Home Fitness Training",
      "Online Fitness Coaching"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BD",
      "addressRegion": "Dhaka"
    },
    "sameAs": [
      "https://www.facebook.com/healthythako",
      "https://www.instagram.com/healthythako",
      "https://www.linkedin.com/company/healthythako"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "10000",
      "bestRating": "5",
      "worstRating": "1"
    },
    "offers": {
      "@type": "Offer",
      "description": "Fitness training and gym membership services",
      "priceCurrency": "BDT",
      "availability": "https://schema.org/InStock"
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I find a fitness trainer in Bangladesh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Use HealthyThako to browse certified fitness trainers in your area. Filter by specialization, location, and price to find the perfect trainer for your goals."
        }
      },
      {
        "@type": "Question", 
        "name": "Can I book gym membership online in Bangladesh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, HealthyThako allows you to browse and book gym memberships online from premium gyms across Bangladesh with flexible payment options."
        }
      },
      {
        "@type": "Question",
        "name": "Are the trainers on HealthyThako certified?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all trainers on HealthyThako are verified and certified professionals with proven experience in fitness training."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>HealthyThako - Find Trainer and Gym in Bangladesh | Bangladesh's First One-Stop Fitness Platform</title>
        <meta name="description" content="HealthyThako - Bangladesh's First One-Stop Fitness Platform. Find certified fitness trainers and premium gyms in Dhaka, Chittagong, Sylhet. Book personal training sessions, gym memberships, and achieve your fitness goals with expert guidance." />
        <meta name="keywords" content="find trainer Bangladesh, gym membership Bangladesh, personal trainer Dhaka, HealthyThako fitness, fitness platform BD, yoga instructor Bangladesh, home fitness trainer, online training Bangladesh, gym finder Bangladesh, fitness coach BD, weight loss trainer, strength training coach" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://healthythako.com/" />
        <meta property="og:title" content="HealthyThako - Find Trainer and Gym in Bangladesh" />
        <meta property="og:description" content="Bangladesh's First One-Stop Fitness Platform. Find certified trainers, book gym memberships, and transform your fitness journey with professional guidance." />
        <meta property="og:image" content="/lovable-uploads/bc34458a-b624-4196-8177-de4588a059e9.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_BD" />
        <meta property="og:site_name" content="HealthyThako" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://healthythako.com/" />
        <meta property="twitter:title" content="HealthyThako - Find Trainer and Gym in Bangladesh" />
        <meta property="twitter:description" content="Bangladesh's First One-Stop Fitness Platform. Find certified trainers, book gym memberships, and transform your fitness journey." />
        <meta property="twitter:image" content="/lovable-uploads/bc34458a-b624-4196-8177-de4588a059e9.png" />

        {/* Local SEO */}
        <meta name="geo.region" content="BD" />
        <meta name="geo.placename" content="Bangladesh" />
        <meta name="geo.position" content="23.8103;90.4125" />
        <meta name="ICBM" content="23.8103, 90.4125" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>

        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href="https://healthythako.com/" />
        <meta name="author" content="HealthyThako Team" />
        <meta name="publisher" content="HealthyThako" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Hreflang for multilingual support */}
        <link rel="alternate" hrefLang="en" href="https://healthythako.com/" />
        <link rel="alternate" hrefLang="bn" href="https://healthythako.com/bn/" />
        <link rel="alternate" hrefLang="x-default" href="https://healthythako.com/" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Header />
        <HeroSection />
        <AcknowledgedBy />
        <OneStopPlatform />
        <FeaturedTrainers />
        <FeaturedGyms />
        <MobileAppShowcase />
        <HowItWorks />
        <SuccessStories />
        <TrustSignals />
        <LocationCoverage />
        <JoinAsTrainer />
        <ListYourGym />
        <CTASection />
        <Footer />
      </div>
    </>
  );
};

export default Index;
