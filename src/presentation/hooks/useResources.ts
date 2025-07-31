// Clean Architecture: Advanced Resources Hook
// Manages resources with clean architecture patterns

import { useState, useEffect, useCallback } from 'react';

// Mock logger for now - will be integrated with actual logger later
const Logger = {
  info: (message: string, data?: any) => console.log(message, data),
  error: (message: string, data?: any) => console.error(message, data)
};

// Type definitions for resources
export interface Resource {
  id: string;
  name: string;
  description: string;
  category: 'medical' | 'transportation' | 'social' | 'emergency' | 'recreation' | 'support' | 'education' | 'financial';
  services: string[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  operatingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  rating?: number;
  reviews?: number;
  cost?: 'free' | 'low' | 'moderate' | 'high';
  accessibility?: string[];
  languages?: string[];
  eligibility?: string[];
  tags: string[];
  featured: boolean;
  verified: boolean;
  lastUpdated: Date;
  createdAt: Date;
}

export interface ResourceFilters {
  category: 'all' | Resource['category'];
  cost: 'all' | Resource['cost'];
  accessibility: string[];
  languages: string[];
  rating: number;
  distance?: number;
  availability: 'all' | 'open-now' | 'open-today';
}

export interface ResourceSearch {
  query: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in miles
  };
}

// Custom hook for managing resources
export function useResources() {
  // State management
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [filters, setFilters] = useState<ResourceFilters>({
    category: 'all',
    cost: 'all',
    accessibility: [],
    languages: [],
    rating: 0,
    availability: 'all'
  });
  const [search, setSearch] = useState<ResourceSearch>({
    query: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Mock data - In real implementation, this would come from use cases
  const mockResources: Resource[] = [
    {
      id: '1',
      name: 'Springfield General Hospital',
      description: 'Full-service hospital providing comprehensive medical care including emergency services, surgery, and specialized treatments.',
      category: 'medical',
      services: ['Emergency Care', 'Surgery', 'Cardiology', 'Oncology', 'Radiology'],
      contact: {
        phone: '(555) 123-4567',
        email: 'info@springfieldgeneral.com',
        website: 'https://springfieldgeneral.com',
        address: {
          street: '123 Medical Center Dr',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701'
        }
      },
      operatingHours: {
        monday: '24/7',
        tuesday: '24/7',
        wednesday: '24/7',
        thursday: '24/7',
        friday: '24/7',
        saturday: '24/7',
        sunday: '24/7'
      },
      rating: 4.5,
      reviews: 342,
      cost: 'high',
      accessibility: ['Wheelchair Accessible', 'Hearing Loop', 'Sign Language Interpreter'],
      languages: ['English', 'Spanish', 'French'],
      eligibility: ['All ages', 'Insurance accepted', 'Medicare/Medicaid'],
      tags: ['hospital', 'emergency', '24/7', 'specialized care'],
      featured: true,
      verified: true,
      lastUpdated: new Date('2024-01-15'),
      createdAt: new Date('2020-01-01')
    },
    {
      id: '2',
      name: 'Senior Transport Services',
      description: 'Reliable transportation for seniors and individuals with mobility challenges. Door-to-door service for medical appointments and daily activities.',
      category: 'transportation',
      services: ['Medical Transport', 'Grocery Shopping', 'Social Outings', 'Airport Transport'],
      contact: {
        phone: '(555) 987-6543',
        email: 'rides@seniortransport.com',
        website: 'https://seniortransport.com'
      },
      operatingHours: {
        monday: '7:00 AM - 7:00 PM',
        tuesday: '7:00 AM - 7:00 PM',
        wednesday: '7:00 AM - 7:00 PM',
        thursday: '7:00 AM - 7:00 PM',
        friday: '7:00 AM - 7:00 PM',
        saturday: '9:00 AM - 5:00 PM',
        sunday: 'Closed'
      },
      rating: 4.8,
      reviews: 156,
      cost: 'moderate',
      accessibility: ['Wheelchair Accessible Vehicles', 'Medical Equipment Transport'],
      languages: ['English', 'Spanish'],
      eligibility: ['Age 55+', 'Disability certification'],
      tags: ['transportation', 'seniors', 'medical appointments', 'accessible'],
      featured: true,
      verified: true,
      lastUpdated: new Date('2024-01-10'),
      createdAt: new Date('2021-03-15')
    },
    {
      id: '3',
      name: 'Community Care Support Group',
      description: 'Weekly support meetings for caregivers and family members. Provides emotional support, resources, and practical advice.',
      category: 'support',
      services: ['Caregiver Support', 'Family Counseling', 'Resource Information', 'Peer Support'],
      contact: {
        phone: '(555) 456-7890',
        email: 'support@communitycare.org',
        website: 'https://communitycare.org',
        address: {
          street: '456 Community Center Ave',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62702'
        }
      },
      operatingHours: {
        tuesday: '6:00 PM - 8:00 PM',
        thursday: '10:00 AM - 12:00 PM',
        saturday: '2:00 PM - 4:00 PM'
      },
      rating: 4.9,
      reviews: 89,
      cost: 'free',
      accessibility: ['Wheelchair Accessible', 'Large Print Materials'],
      languages: ['English', 'Spanish', 'Polish'],
      eligibility: ['Caregivers', 'Family members', 'All ages welcome'],
      tags: ['support group', 'caregivers', 'emotional support', 'free'],
      featured: false,
      verified: true,
      lastUpdated: new Date('2024-01-20'),
      createdAt: new Date('2019-06-01')
    },
    {
      id: '4',
      name: 'Meals on Wheels Springfield',
      description: 'Home-delivered nutrition program providing fresh meals to seniors and individuals who are homebound or have difficulty preparing meals.',
      category: 'social',
      services: ['Meal Delivery', 'Nutrition Education', 'Wellness Checks', 'Emergency Meals'],
      contact: {
        phone: '(555) 234-5678',
        email: 'meals@mowspringfield.org',
        website: 'https://mowspringfield.org'
      },
      operatingHours: {
        monday: '9:00 AM - 3:00 PM',
        tuesday: '9:00 AM - 3:00 PM',
        wednesday: '9:00 AM - 3:00 PM',
        thursday: '9:00 AM - 3:00 PM',
        friday: '9:00 AM - 3:00 PM'
      },
      rating: 4.7,
      reviews: 203,
      cost: 'low',
      accessibility: ['Home Delivery', 'Special Dietary Accommodations'],
      languages: ['English'],
      eligibility: ['Age 60+', 'Homebound individuals', 'Disability eligible'],
      tags: ['meals', 'delivery', 'seniors', 'nutrition', 'homebound'],
      featured: true,
      verified: true,
      lastUpdated: new Date('2024-01-18'),
      createdAt: new Date('2018-04-12')
    },
    {
      id: '5',
      name: 'Springfield Recreation Center',
      description: 'Community recreation center offering fitness classes, social activities, and wellness programs specifically designed for seniors.',
      category: 'recreation',
      services: ['Fitness Classes', 'Swimming Pool', 'Social Activities', 'Health Screenings'],
      contact: {
        phone: '(555) 345-6789',
        email: 'info@springfieldrec.gov',
        website: 'https://springfieldrec.gov',
        address: {
          street: '789 Recreation Blvd',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62703'
        }
      },
      operatingHours: {
        monday: '6:00 AM - 10:00 PM',
        tuesday: '6:00 AM - 10:00 PM',
        wednesday: '6:00 AM - 10:00 PM',
        thursday: '6:00 AM - 10:00 PM',
        friday: '6:00 AM - 10:00 PM',
        saturday: '8:00 AM - 8:00 PM',
        sunday: '10:00 AM - 6:00 PM'
      },
      rating: 4.3,
      reviews: 127,
      cost: 'low',
      accessibility: ['Wheelchair Accessible', 'Accessible Pool', 'Modified Equipment'],
      languages: ['English', 'Spanish'],
      eligibility: ['All ages', 'Senior discounts available'],
      tags: ['recreation', 'fitness', 'swimming', 'seniors', 'community'],
      featured: false,
      verified: true,
      lastUpdated: new Date('2024-01-12'),
      createdAt: new Date('2020-09-01')
    }
  ];

  // Get user's location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          Logger.info('User location obtained', { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          });
        },
        (error) => {
          Logger.error('Failed to get user location', error);
        }
      );
    }
  }, []);

  // Calculate distance between two points (simplified)
  const calculateDistance = useCallback((
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Check if resource is currently open
  const isResourceOpen = useCallback((resource: Resource): boolean => {
    if (!resource.operatingHours) return true;
    
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[now.getDay()] as keyof typeof resource.operatingHours;
    const todayHours = resource.operatingHours[dayOfWeek];
    
    if (!todayHours || todayHours === 'Closed') return false;
    if (todayHours === '24/7') return true;
    
    // Simple time check (would need more robust implementation)
    // This is a simplified check - would need proper time parsing
    return true; // Placeholder
  }, []);

  // Apply filters and search
  const applyFiltersAndSearch = useCallback((
    allResources: Resource[],
    currentFilters: ResourceFilters,
    currentSearch: ResourceSearch
  ): Resource[] => {
    let filtered = [...allResources];

    // Apply search query
    if (currentSearch.query.trim()) {
      const query = currentSearch.query.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.name.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.services.some(service => service.toLowerCase().includes(query)) ||
        resource.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (currentFilters.category !== 'all') {
      filtered = filtered.filter(resource => resource.category === currentFilters.category);
    }

    // Apply cost filter
    if (currentFilters.cost !== 'all') {
      filtered = filtered.filter(resource => resource.cost === currentFilters.cost);
    }

    // Apply rating filter
    if (currentFilters.rating > 0) {
      filtered = filtered.filter(resource => (resource.rating || 0) >= currentFilters.rating);
    }

    // Apply accessibility filter
    if (currentFilters.accessibility.length > 0) {
      filtered = filtered.filter(resource =>
        currentFilters.accessibility.every(requirement =>
          resource.accessibility?.includes(requirement)
        )
      );
    }

    // Apply language filter
    if (currentFilters.languages.length > 0) {
      filtered = filtered.filter(resource =>
        currentFilters.languages.some(language =>
          resource.languages?.includes(language)
        )
      );
    }

    // Apply availability filter
    if (currentFilters.availability === 'open-now' || currentFilters.availability === 'open-today') {
      filtered = filtered.filter(resource => isResourceOpen(resource));
    }

    // Sort by featured first, then by rating
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });

    return filtered;
  }, [isResourceOpen]);

  // Load resources
  const loadResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      Logger.info('Loading resources');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setResources(mockResources);
      Logger.info('Resources loaded successfully', { count: mockResources.length });
    } catch (err) {
      const errorMessage = 'Failed to load resources';
      setError(errorMessage);
      Logger.error('Error loading resources', err);
    } finally {
      setIsLoading(false);
    }
  }, [mockResources]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ResourceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Update search
  const updateSearch = useCallback((newSearch: Partial<ResourceSearch>) => {
    setSearch(prev => ({ ...prev, ...newSearch }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      category: 'all',
      cost: 'all',
      accessibility: [],
      languages: [],
      rating: 0,
      availability: 'all'
    });
    setSearch({ query: '' });
  }, []);

  // Get resource by ID
  const getResourceById = useCallback((id: string): Resource | null => {
    return resources.find(resource => resource.id === id) || null;
  }, [resources]);

  // Get featured resources
  const getFeaturedResources = useCallback((): Resource[] => {
    return resources.filter(resource => resource.featured);
  }, [resources]);

  // Get resources by category
  const getResourcesByCategory = useCallback((category: Resource['category']): Resource[] => {
    return resources.filter(resource => resource.category === category);
  }, [resources]);

  // Apply filters when they change
  useEffect(() => {
    const filtered = applyFiltersAndSearch(resources, filters, search);
    setFilteredResources(filtered);
  }, [resources, filters, search, applyFiltersAndSearch]);

  // Load resources on mount
  useEffect(() => {
    loadResources();
    getUserLocation();
  }, [loadResources, getUserLocation]);

  // Computed values
  const getFilteredCount = useCallback(() => filteredResources.length, [filteredResources]);
  const getTotalCount = useCallback(() => resources.length, [resources]);
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.cost !== 'all') count++;
    if (filters.rating > 0) count++;
    if (filters.accessibility.length > 0) count++;
    if (filters.languages.length > 0) count++;
    if (filters.availability !== 'all') count++;
    if (search.query.trim()) count++;
    return count;
  }, [filters, search]);

  const getCategoryCounts = useCallback(() => {
    const counts: Record<string, number> = {};
    resources.forEach(resource => {
      counts[resource.category] = (counts[resource.category] || 0) + 1;
    });
    return counts;
  }, [resources]);

  return {
    // Data
    resources,
    filteredResources,
    filters,
    search,
    userLocation,

    // State
    isLoading,
    error,

    // Actions
    loadResources,
    updateFilters,
    updateSearch,
    clearFilters,
    getUserLocation,

    // Getters
    getResourceById,
    getFeaturedResources,
    getResourcesByCategory,

    // Computed values
    getFilteredCount,
    getTotalCount,
    getActiveFiltersCount,
    getCategoryCounts,

    // Utilities
    calculateDistance,
    isResourceOpen
  };
}
