// Clean Architecture: Advanced Resources Page
// Professional resources interface with clean architecture integration

import React, { useState, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  Users,
  Shield,
  Navigation,
  Award
} from 'lucide-react';
import { useResources } from '../hooks/useResources';
import type { Resource, ResourceFilters } from '../hooks/useResources';
import './AdvancedResources.css';

interface ResourceCardProps {
  resource: Resource;
  userLocation?: { latitude: number; longitude: number } | null;
  onCalculateDistance?: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  userLocation, 
  onCalculateDistance 
}) => {
  const [expanded, setExpanded] = useState(false);

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="resource-rating">
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={star <= rating ? 'star-filled' : 'star-empty'}
            />
          ))}
        </div>
        <span className="rating-text">{rating}</span>
        {resource.reviews && (
          <span className="reviews-text">({resource.reviews} reviews)</span>
        )}
      </div>
    );
  };

  const renderCostBadge = (cost?: Resource['cost']) => {
    if (!cost) return null;
    
    const costConfig = {
      free: { label: 'Free', className: 'cost-free' },
      low: { label: '$', className: 'cost-low' },
      moderate: { label: '$$', className: 'cost-moderate' },
      high: { label: '$$$', className: 'cost-high' }
    };
    
    const config = costConfig[cost];
    
    return (
      <span className={`cost-badge ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatAddress = (address?: Resource['contact']['address']) => {
    if (!address) return null;
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  const calculateDistance = () => {
    if (!userLocation || !resource.contact.address || !onCalculateDistance) return null;
    
    // Mock coordinates for demo - in real app, would geocode the address
    const resourceLat = 39.7817; // Springfield, IL approximate
    const resourceLon = -89.6501;
    
    const distance = onCalculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      resourceLat,
      resourceLon
    );
    
    return distance.toFixed(1);
  };

  const distance = calculateDistance();

  return (
    <div className={`resource-card ${resource.featured ? 'featured' : ''}`}>
      <div className="resource-header">
        <div className="resource-title-section">
          <h3 className="resource-name">
            {resource.name}
            {resource.verified && (
              <span title="Verified Resource">
                <Shield size={16} className="verified-icon" />
              </span>
            )}
            {resource.featured && (
              <span title="Featured Resource">
                <Award size={16} className="featured-icon" />
              </span>
            )}
          </h3>
          <div className="resource-meta">
            <span className="resource-category">{resource.category}</span>
            {renderCostBadge(resource.cost)}
            {distance && (
              <span className="resource-distance">
                <Navigation size={12} />
                {distance} mi
              </span>
            )}
          </div>
        </div>
        {renderRating(resource.rating)}
      </div>

      <p className="resource-description">{resource.description}</p>

      <div className="resource-services">
        {resource.services.slice(0, 3).map((service, index) => (
          <span key={index} className="service-tag">
            {service}
          </span>
        ))}
        {resource.services.length > 3 && (
          <span className="service-tag more">
            +{resource.services.length - 3} more
          </span>
        )}
      </div>

      <div className="resource-contact">
        {resource.contact.phone && (
          <a href={`tel:${resource.contact.phone}`} className="contact-link">
            <Phone size={16} />
            {resource.contact.phone}
          </a>
        )}
        {resource.contact.website && (
          <a 
            href={resource.contact.website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="contact-link"
          >
            <Globe size={16} />
            Website
          </a>
        )}
        {resource.contact.email && (
          <a href={`mailto:${resource.contact.email}`} className="contact-link">
            <Mail size={16} />
            Email
          </a>
        )}
      </div>

      {resource.contact.address && (
        <div className="resource-address">
          <MapPin size={16} />
          <span>{formatAddress(resource.contact.address)}</span>
        </div>
      )}

      <button
        className="expand-button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {expanded ? 'Less Info' : 'More Info'}
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="resource-details">
          {resource.operatingHours && (
            <div className="operating-hours">
              <h4>Operating Hours</h4>
              <div className="hours-grid">
                {Object.entries(resource.operatingHours).map(([day, hours]) => (
                  <div key={day} className="hours-row">
                    <span className="day">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                    <span className="hours">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resource.accessibility && resource.accessibility.length > 0 && (
            <div className="accessibility-info">
              <h4>Accessibility</h4>
              <div className="accessibility-tags">
                {resource.accessibility.map((feature, index) => (
                  <span key={index} className="accessibility-tag">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {resource.languages && resource.languages.length > 0 && (
            <div className="language-info">
              <h4>Languages</h4>
              <div className="language-tags">
                {resource.languages.map((language, index) => (
                  <span key={index} className="language-tag">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {resource.eligibility && resource.eligibility.length > 0 && (
            <div className="eligibility-info">
              <h4>Eligibility</h4>
              <ul className="eligibility-list">
                {resource.eligibility.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface FilterPanelProps {
  filters: ResourceFilters;
  onFiltersChange: (filters: Partial<ResourceFilters>) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  categoryCounts: Record<string, number>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFiltersCount,
  categoryCounts
}) => {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'medical', label: 'Medical Care' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'social', label: 'Social Services' },
    { value: 'emergency', label: 'Emergency Services' },
    { value: 'recreation', label: 'Recreation' },
    { value: 'support', label: 'Support Groups' },
    { value: 'education', label: 'Education' },
    { value: 'financial', label: 'Financial Assistance' }
  ];

  const costOptions = [
    { value: 'all', label: 'Any Cost' },
    { value: 'free', label: 'Free' },
    { value: 'low', label: 'Low Cost ($)' },
    { value: 'moderate', label: 'Moderate ($$)' },
    { value: 'high', label: 'High Cost ($$$)' }
  ];

  const availabilityOptions = [
    { value: 'all', label: 'Any Time' },
    { value: 'open-now', label: 'Open Now' },
    { value: 'open-today', label: 'Open Today' }
  ];

  const accessibilityOptions = [
    'Wheelchair Accessible',
    'Hearing Loop',
    'Sign Language Interpreter',
    'Large Print Materials',
    'Braille Available',
    'Accessible Parking'
  ];

  const languageOptions = [
    'English',
    'Spanish',
    'French',
    'German',
    'Polish',
    'Chinese',
    'Arabic'
  ];

  const handleAccessibilityChange = (accessibility: string, checked: boolean) => {
    const current = filters.accessibility || [];
    const updated = checked
      ? [...current, accessibility]
      : current.filter(a => a !== accessibility);
    onFiltersChange({ accessibility: updated });
  };

  const handleLanguageChange = (language: string, checked: boolean) => {
    const current = filters.languages || [];
    const updated = checked
      ? [...current, language]
      : current.filter(l => l !== language);
    onFiltersChange({ languages: updated });
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        {activeFiltersCount > 0 && (
          <button onClick={onClearFilters} className="clear-filters">
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="filter-section">
        <h4>Category</h4>
        <div className="filter-options">
          {categories.map((category) => (
            <label key={category.value} className="filter-option">
              <input
                type="radio"
                name="category"
                value={category.value}
                checked={filters.category === category.value}
                onChange={(e) => onFiltersChange({ category: e.target.value as any })}
              />
              <span className="filter-label">
                {category.label}
                {category.value !== 'all' && categoryCounts[category.value] && (
                  <span className="filter-count">({categoryCounts[category.value]})</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Cost</h4>
        <div className="filter-options">
          {costOptions.map((option) => (
            <label key={option.value} className="filter-option">
              <input
                type="radio"
                name="cost"
                value={option.value}
                checked={filters.cost === option.value}
                onChange={(e) => onFiltersChange({ cost: e.target.value as any })}
              />
              <span className="filter-label">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Rating</h4>
        <div className="rating-filter">
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.rating}
            onChange={(e) => onFiltersChange({ rating: parseFloat(e.target.value) })}
            className="rating-slider"
          />
          <div className="rating-display">
            {filters.rating > 0 ? (
              <span>{filters.rating}+ stars</span>
            ) : (
              <span>Any rating</span>
            )}
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h4>Availability</h4>
        <div className="filter-options">
          {availabilityOptions.map((option) => (
            <label key={option.value} className="filter-option">
              <input
                type="radio"
                name="availability"
                value={option.value}
                checked={filters.availability === option.value}
                onChange={(e) => onFiltersChange({ availability: e.target.value as any })}
              />
              <span className="filter-label">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Accessibility</h4>
        <div className="filter-options">
          {accessibilityOptions.map((option) => (
            <label key={option} className="filter-option">
              <input
                type="checkbox"
                checked={filters.accessibility?.includes(option) || false}
                onChange={(e) => handleAccessibilityChange(option, e.target.checked)}
              />
              <span className="filter-label">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Languages</h4>
        <div className="filter-options">
          {languageOptions.map((option) => (
            <label key={option} className="filter-option">
              <input
                type="checkbox"
                checked={filters.languages?.includes(option) || false}
                onChange={(e) => handleLanguageChange(option, e.target.checked)}
              />
              <span className="filter-label">{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdvancedResources: React.FC = () => {
  const {
    filteredResources,
    filters,
    search,
    isLoading,
    error,
    userLocation,
    updateFilters,
    updateSearch,
    clearFilters,
    getUserLocation,
    getFilteredCount,
    getTotalCount,
    getActiveFiltersCount,
    getCategoryCounts,
    getFeaturedResources,
    calculateDistance
  } = useResources();

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'distance' | 'name'>('relevance');

  const handleSearchChange = useCallback((query: string) => {
    updateSearch({ query });
  }, [updateSearch]);

  const handleSortChange = useCallback((newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
    // In a real implementation, this would trigger re-sorting of results
  }, []);

  const featuredResources = getFeaturedResources();

  if (error) {
    return (
      <div className="resources-error">
        <h2>Unable to Load Resources</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="advanced-resources">
      <div className="resources-header">
        <div className="header-content">
          <h1>Community Resources</h1>
          <p>Find local services and support for care recipients and their families</p>
        </div>
      </div>

      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search resources, services, or organizations..."
              value={search.query}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-input"
            />
            {search.query && (
              <button
                onClick={() => handleSearchChange('')}
                className="clear-search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
          >
            <Filter size={18} />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="filter-count">{getActiveFiltersCount()}</span>
            )}
          </button>
          {!userLocation && (
            <button onClick={getUserLocation} className="location-button">
              <Navigation size={18} />
              Enable Location
            </button>
          )}
        </div>

        <div className="search-results-info">
          <span className="results-count">
            {isLoading ? 'Loading...' : `${getFilteredCount()} of ${getTotalCount()} resources`}
          </span>
          <div className="sort-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
              className="sort-select"
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Rating</option>
              <option value="distance">Distance</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {featuredResources.length > 0 && !search.query && getActiveFiltersCount() === 0 && (
        <div className="featured-section">
          <h2>Featured Resources</h2>
          <div className="featured-grid">
            {featuredResources.slice(0, 3).map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                userLocation={userLocation}
                onCalculateDistance={calculateDistance}
              />
            ))}
          </div>
        </div>
      )}

      <div className="resources-content">
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            activeFiltersCount={getActiveFiltersCount()}
            categoryCounts={getCategoryCounts()}
          />
        )}

        <div className="resources-main">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>No Resources Found</h3>
              <p>Try adjusting your search terms or filters to find more resources.</p>
              {getActiveFiltersCount() > 0 && (
                <button onClick={clearFilters} className="clear-filters-button">
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="resources-grid">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  userLocation={userLocation}
                  onCalculateDistance={calculateDistance}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedResources;
