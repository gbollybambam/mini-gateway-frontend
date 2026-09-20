'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        
        {/* Animated-style Success Icon */}
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Thank you! Your payment has been securely processed and the merchant has been notified.
        </p>
        
        {/* Transaction Reference Receipt */}
        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-sm flex justify-between items-center border border-gray-100">
          <span className="text-gray-500">Transaction Ref:</span>
          <span className="font-mono font-medium text-gray-900">
            {reference ? `${reference.slice(0, 16)}...` : 'N/A'}
          </span>
        </div>

        {/* Return Button pointing to Home (/) */}
        <Link 
          href="/"
          className="block w-full py-3.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all shadow-sm"
        >
          Return to Homepage
        </Link>
        
        {/* Subtle Branding */}
        <div className="mt-8 pt-6 border-t border-gray-50">
          <p className="text-xs text-gray-400 font-medium">
            Powered by Imago Gateway
          </p>
        </div>

      </div>
    </div>
  );
}