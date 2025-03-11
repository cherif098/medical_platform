import React from 'react';

const Partnership = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-2xl">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Fonctionnalité en développement</h1>
        
        <p className="text-gray-600 mb-6">
          La page des partenariats est actuellement en cours de conception. 
          Cette fonctionnalité sera disponible prochainement.
        </p>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">
            Merci de votre patience pendant que nous travaillons pour améliorer votre expérience.
            Revenez bientôt pour découvrir les nouvelles fonctionnalités de partenariat!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Partnership;