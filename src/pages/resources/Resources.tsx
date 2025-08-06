import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  Filter,
} from "lucide-react";
import type { Resource } from "../../types";
import { dataService } from "../../services/dataService";
import "./Resources.css";

import caregiving1 from "../../pages/dashboard/components/pics/koala.png";
import caregiving2 from "../../pages/dashboard/components/pics/koala.png";
import caregiving3 from "../../pages/dashboard/components/pics/koala.png";

const Resources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | Resource["category"]
  >("all");
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    setResources(dataService.getResources());
  }, []);

  const categories = [
    { value: "all" as const, label: "All Resources" },
    { value: "medical" as const, label: "Medical Care" },
    { value: "transportation" as const, label: "Transportation" },
    { value: "social" as const, label: "Social Services" },
    { value: "emergency" as const, label: "Emergency Services" },
    { value: "recreation" as const, label: "Recreation" },
    { value: "support" as const, label: "Support Groups" },
  ];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.services.some((service) =>
        service.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`star ${index < Math.floor(rating) ? "filled" : ""}`}
      />
    ));
  };

  const articleList = [
    {
      id: 1,
      title: "Caring for Yourself",
      image: caregiving1,
      url: "https://www.caregiver.org/caregiver-resources/caring-for-yourself/",
      description:
        "As a caregiver, we often overlook our own wellbeing we deserve.",
    },
    {
      id: 2,
      title: "Managing Elderly Behaviours",
      image: caregiving2,
      url: "https://ntuchealth.sg/elderly-care/resources/health-and-wellness/5-difficult-elderly-behaviours-and-how-to-manage-them",
      description: "Learn how to react to common elderly habits.",
    },
    {
      id: 3,
      title: "Building a Support System",
      image: caregiving3,
      url: "https://mentalh2o.org/how-to-build-a-support-network-the-importance-of-strong-relationships/",
      description: "Connect with others to accompany your journey.",
    },
    {
      id: 4,
      title: "Caring for Yourself",
      image: caregiving1,
      url: "https://www.caregiver.org/caregiver-resources/caring-for-yourself/",
      description: "Self-care tips for caregivers.",
    },
    {
      id: 5,
      title: "Dementia Hub Singapore",
      image: caregiving2,
      url: "https://www.dementiahub.sg/",
      description: "A simple guide to caregiving practices for seniors.",
    },
  ];

  return (
    <div className="resources">
      <div className="page-header">
        <h1>Community Resources</h1>
        <p>
          Find caregiving articles, healthcare providers, support services, and
          community resources in Singapore.
        </p>
      </div>

      {/* Articles Section - FIXED STRUCTURE */}
      <div className="articles-section">
        <h2>Featured Articles</h2>
        <div className="articles-grid">
          {articleList.map((article) => (
            <div className="article-card" key={article.id}>
              <img
                src={article.image}
                alt={article.title}
                className="article-image"
              />
              <div className="article-content">
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Read Article
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2>Locations</h2>

      {/* Search and Filter */}
      <div className="card">
        <div className="search-filters">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search resources, services, or providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <Filter className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value as "all" | Resource["category"]
                )
              }
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="results-count">
        {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
      </div>

      {/* Resources List */}
      <div className="resources-grid">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="resource-card">
            <div className="resource-header">
              <div className="resource-info">
                <h3>{resource.name}</h3>
                <span className="resource-category">{resource.category}</span>
              </div>
              <div className="resource-rating">
                <div className="stars">{renderStars(resource.rating)}</div>
                <span className="rating-text">{resource.rating}</span>
              </div>
            </div>

            <p className="resource-description">{resource.description}</p>

            <div className="resource-services">
              <h4>Services</h4>
              <div className="services-list">
                {resource.services.map((service) => (
                  <span key={service} className="service-tag">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="resource-contact">
              <div className="contact-item">
                <MapPin />
                <span>{resource.address}</span>
              </div>
              <div className="contact-item">
                <Phone />
                <span>{resource.phone}</span>
              </div>
              {resource.website && (
                <div className="contact-item">
                  <Globe />
                  <a
                    href={resource.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              <div className="contact-item">
                <Clock />
                <div className="resource-hours">
                  <span className="hours-status open">{resource.hours}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="empty-state">
          <h3>No resources found</h3>
          <p>Try adjusting your search terms or category filter.</p>
        </div>
      )}
    </div>
  );
};

export default Resources;