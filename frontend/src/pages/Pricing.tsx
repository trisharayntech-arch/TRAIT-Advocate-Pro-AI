import React, { useState } from 'react';
import { Link } from 'react-router-dom';

type BillingPeriod = '6' | '12';

const plans = [
  {
    id: 'advocate',
    name: 'Advocate',
    subtitle: 'For Individual Lawyers',
    icon: '♟',
    prices: { '6': 3999, '12': 5999 },
    monthly: { '6': 667, '12': 500 },
    savings: 25,
    features: [
      'AI Legal Assistant',
      'Legal Drafting & Templates',
      'Document Summary & Analysis',
      'Case Law Search',
      'Personal Workspace',
    ],
  },
  {
    id: 'advocate-pro',
    name: 'Advocate Pro',
    subtitle: 'For Active Practitioners',
    icon: '★',
    prices: { '6': 8999, '12': 11999 },
    monthly: { '6': 1500, '12': 1000 },
    savings: 33,
    popular: true,
    features: [
      'Everything in Advocate Plan',
      'Advanced Legal Research',
      'Detailed Document Analysis',
      'Case Insights & Tracking',
      'Higher AI Usage Limits',
      'Priority Support',
    ],
  },
  {
    id: 'law-firm',
    name: 'Law Firm',
    subtitle: 'For Teams & Chambers',
    icon: '♟',
    prices: { '6': 24999, '12': 33999 },
    monthly: { '6': 4167, '12': 2833 },
    savings: 33,
    features: [
      'Everything in Advocate Pro Plan',
      'Multiple User Access (up to 5)',
      'Shared Case & Document Workspace',
      'Team & Role Management',
      'Client Management',
      'Usage Analytics & Reports',
    ],
  },
];

const formatPrice = (price: number) =>
  `₹${price.toLocaleString('en-IN')}`;

export const Pricing: React.FC = () => {
  const [billing, setBilling] = useState<BillingPeriod>('6');

  return (
    <div className="min-h-screen bg-[#FFFFF0] px-4 py-10 md:px-8">

      {/* Header */}
      <div className="mx-auto mb-10 max-w-5xl text-center">

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E9DCC6] bg-[#FFFCF5] px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#476B3F]">
          TRAIT Advocate Pro AI
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#34452F] md:text-5xl">
          Choose Your Legal Intelligence Plan
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#7D806B] md:text-base">
          Powerful AI tools designed for individual advocates,
          active practitioners and modern law firms.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-[#E9DCC6] bg-[#FFFCF5] p-1.5 shadow-sm">

          <button
            onClick={() => setBilling('6')}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              billing === '6'
                ? 'bg-[#476B3F] text-white shadow-md'
                : 'text-[#53602F] hover:bg-[#F8EFDF]'
            }`}
          >
            6 Months
          </button>

          <button
            onClick={() => setBilling('12')}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              billing === '12'
                ? 'bg-[#476B3F] text-white shadow-md'
                : 'text-[#53602F] hover:bg-[#F8EFDF]'
            }`}
          >
            12 Months
            <span className="ml-2 rounded-full bg-[#EAA34B] px-2 py-1 text-[10px] font-bold text-[#34452F]">
              SAVE MORE
            </span>
          </button>

        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-7 lg:grid-cols-3">

        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-3xl border p-6 shadow-xl transition duration-300 hover:-translate-y-1 ${
              plan.popular
                ? 'border-[#EAA34B] bg-[#34452F] text-white ring-2 ring-[#EAA34B] lg:scale-105'
                : 'border-[#E9DCC6] bg-[#FFFCF5] text-[#34452F]'
            }`}
          >

            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#EAA34B] px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-[#34452F] shadow-lg">
                ★ Most Popular
              </div>
            )}

            {/* Plan Heading */}
            <div className="mb-6 mt-2 flex items-center gap-4">

              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl ${
                  plan.popular
                    ? 'bg-[#EAA34B] text-[#34452F]'
                    : 'bg-[#F8EFDF] text-[#476B3F]'
                }`}
              >
                {plan.icon}
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  {plan.name}
                </h2>

                <p className={`mt-1 text-sm ${
                  plan.popular ? 'text-[#E9DCC6]' : 'text-[#7D806B]'
                }`}>
                  {plan.subtitle}
                </p>
              </div>

            </div>

            <div className={`mb-5 border-t ${
              plan.popular ? 'border-[#71805F]' : 'border-[#E9DCC6]'
            }`} />

            {/* Features */}
            <div className="flex-1 space-y-4">

              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">

                  <span className={`mt-0.5 text-lg font-bold ${
                    plan.popular ? 'text-[#EAA34B]' : 'text-[#476B3F]'
                  }`}>
                    ✓
                  </span>

                  <span className="text-sm leading-6">
                    {feature}
                  </span>

                </div>
              ))}

            </div>

            {/* Pricing */}
            <div className={`mt-8 rounded-2xl border p-5 ${
              plan.popular
                ? 'border-[#EAA34B] bg-[#FFFFF0] text-[#34452F]'
                : 'border-[#E9DCC6] bg-[#F8EFDF] text-[#34452F]'
            }`}>

              <div className="flex items-center justify-between gap-2">

                <span className="font-semibold">
                  {billing} Months
                </span>

                <div className="text-right">

                  <p className="text-3xl font-extrabold">
                    {formatPrice(plan.prices[billing])}
                  </p>

                  <p className="text-xs text-[#7D806B]">
                    ₹{plan.monthly[billing].toLocaleString('en-IN')}/month
                  </p>

                </div>

              </div>

              {billing === '12' && (
                <div className="mt-3 inline-block rounded-full bg-[#EAA34B] px-3 py-1 text-xs font-bold text-[#34452F]">
                  Save {plan.savings}% annually
                </div>
              )}

            </div>

            {/* Subscribe Button */}
            <Link
              to={`/register?plan=${plan.id}&billing=${billing}`}
              className={`mt-5 block rounded-xl px-5 py-4 text-center text-sm font-bold transition ${
                plan.popular
                  ? 'bg-[#EAA34B] text-[#34452F] hover:bg-[#D18A32]'
                  : 'bg-[#476B3F] text-white hover:bg-[#34452F]'
              }`}
            >
              Choose {plan.name} →
            </Link>

          </div>
        ))}

      </div>

      {/* Benefits */}
      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-8 border-t border-[#E9DCC6] pt-10 text-center md:grid-cols-5">

        {[
          ['⚡', 'Higher Savings', 'With 12-Month Plan'],
          ['⟳', 'Full Features', 'Plan-Based Access'],
          ['◉', 'Priority Support', 'Dedicated Assistance'],
          ['▣', 'Flexible Billing', 'Secure Payment'],
          ['✓', 'Flexible Plans', 'Upgrade Anytime'],
        ].map(([icon, title, subtitle]) => (
          <div key={title}>
            <div className="mb-3 text-3xl text-[#476B3F]">
              {icon}
            </div>

            <h3 className="font-bold text-[#34452F]">
              {title}
            </h3>

            <p className="mt-1 text-xs text-[#7D806B]">
              {subtitle}
            </p>
          </div>
        ))}

      </div>

      {/* Footer */}
      <div className="mt-12 text-center">

        <p className="text-sm text-[#7D806B]">
          Need a customised solution for your legal team?
        </p>

        <p className="mt-2 font-semibold text-[#476B3F]">
          Contact TRAIT Advocate Pro AI
        </p>

        <p className="mt-6 text-xs text-[#7D806B]">
          © 2026 TRAIT Innovation. All Rights Reserved.
        </p>

      </div>

    </div>
  );
};

export default Pricing;