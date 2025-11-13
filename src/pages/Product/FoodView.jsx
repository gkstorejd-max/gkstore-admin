import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { getFood } from '../../services/ProductApi';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FaEdit } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const FoodView = () => {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    variants: false,
    ingredients: false,
  });

  useEffect(() => {
    fetchFood();
  }, [foodId]);

  const fetchFood = async () => {
    try {
      setLoading(true);
      const { food } = await getFood(foodId);
      setFood(food);
    } catch (error) {
      console.error('Error fetching food:', error);
      toast.error('Failed to fetch food details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleNextImage = () => {
    if (food?.foodImages?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % food.foodImages.length);
    }
  };

  const handlePrevImage = () => {
    if (food?.foodImages?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + food.foodImages.length) % food.foodImages.length);
    }
  };

  const handleEditFood = () => {
    toast.info(`Edit food ${foodId} (implement functionality)`);
    // Navigate to an edit page or open a modal (to be implemented)
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-500">
        <div className="text-sm sm:text-base">Loading food details...</div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-600">
        <p className="text-sm sm:text-base font-medium">Food item not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{food.name}</h2>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-3 sm:px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors transform hover:scale-105"
          >
            <ChevronLeft size={18} className="mr-1" />
            Back
          </button>
          <button
            onClick={handleEditFood}
            className="flex items-center px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors transform hover:scale-105"
          >
            <FaEdit size={16} className="mr-1" />
            Edit
          </button>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="relative mb-6">
        {food.foodImages && food.foodImages.length > 0 ? (
          <div className="relative group">
            <img
              src={food.foodImages[currentImageIndex]}
              alt={food.name}
              className="w-full h-64 sm:h-96 object-cover rounded-lg shadow-md transform transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black opacity-10 group-hover:opacity-0 transition-opacity duration-300 rounded-lg"></div>
            {food.foodImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors opacity-75 hover:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors opacity-75 hover:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-64 sm:h-96 bg-gray-100 flex items-center justify-center rounded-lg shadow-md">
            <span className="text-gray-500 text-sm">No image available</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="space-y-4">
        {/* Description */}
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Description</h3>
          <p className="text-sm text-gray-600">{food.description || 'No description provided.'}</p>
        </div>

        {/* Basic Info */}
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Category:</span> {food.category?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Item Type:</span> {food.itemType || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Cook Time:</span> {food.cookTime || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Status:</span>{' '}
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                  food.status === 'Active'
                    ? 'bg-green-100 text-green-600 border border-green-200'
                    : 'bg-red-100 text-red-600 border border-red-200'
                }`}
              >
                {food.status}
              </span>
            </div>
            <div>
              <span className="font-medium">Discount:</span> {food.discount ? `${food.discount}%` : 'No discount'}
            </div>
            <div>
              <span className="font-medium">Created By:</span> {food.createdBy || 'Unknown'}
            </div>
            <div>
              <span className="font-medium">Created At:</span>{' '}
              {food.createdAt ? new Date(food.createdAt).toLocaleString() : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Updated At:</span>{' '}
              {food.updatedAt ? new Date(food.updatedAt).toLocaleString() : 'N/A'}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <button
            className="w-full flex justify-between items-center text-base sm:text-lg font-semibold text-gray-800"
            onClick={() => toggleSection('ingredients')}
          >
            Ingredients
            <span>{expandedSections.ingredients ? '▲' : '▼'}</span>
          </button>
          {expandedSections.ingredients && (
            <p className="mt-2 text-sm text-gray-600">
              {food.ingredients?.join(', ') || 'No ingredients provided.'}
            </p>
          )}
        </div>

        {/* Variants */}
        <div className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <button
            className="w-full flex justify-between items-center text-base sm:text-lg font-semibold text-gray-800"
            onClick={() => toggleSection('variants')}
          >
            Variants
            <span>{expandedSections.variants ? '▲' : '▼'}</span>
          </button>
          {expandedSections.variants && (
            <div className="mt-2 space-y-2">
              {food.variants?.length > 0 ? (
                food.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <span className="text-sm text-gray-700">{variant.name}</span>
                    <div className="text-sm text-gray-800">
                      ₹{variant.price.toFixed(2)}{' '}
                      {variant.priceAfterDiscount && (
                        <span className="text-red-500 line-through ml-2">
                          ₹{variant.priceAfterDiscount.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No variants available.</p>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {food.isHotProduct && (
            <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full hover:shadow-md transition-shadow">
              Hot
            </span>
          )}
          {food.isFeatured && (
            <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full hover:shadow-md transition-shadow">
              Featured
            </span>
          )}
          {food.isRecommended && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-600 text-xs font-semibold rounded-full hover:shadow-md transition-shadow">
              Recommended
            </span>
          )}
          {food.isBudgetBite && (
            <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-semibold rounded-full hover:shadow-md transition-shadow">
              Budget Bite
            </span>
          )}
          {food.isSpecialOffer && (
            <span className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full hover:shadow-md transition-shadow">
              Special Offer
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodView;