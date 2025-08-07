const mongoose = require('mongoose');
require('dotenv').config();

const ExternalResource = require('../models/ExternalResource');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB, seeding resources...');

    const resources = [
      {
        title: "Caring for Seniors at Home",
        description: "A simple guide to caregiving practices for seniors.",
        url: "https://www.healthhub.sg/live-healthy/258/caring_for_elderly_at_home",
        image: "https://images.pexels.com/photos/3768146/pexels-photo-3768146.jpeg",
        category: "Article",
        postedBy: "Gov.sg"
      },
      {
        title: "Dementia Hub Singapore",
        description: "Explore dementia support, training and services in SG.",
        url: "https://www.dementiahub.sg/",
        image: "https://images.pexels.com/photos/3768140/pexels-photo-3768140.jpeg",
        category: "Tool",
        postedBy: "Agency for Integrated Care"
      },
      {
        title: "Caregiver Support App - iConnect",
        description: "App for stress management, reminders, and support.",
        url: "https://www.aic.sg/resources/caregiver-apps",
        image: "https://images.pexels.com/photos/4006603/pexels-photo-4006603.jpeg",
        category: "App",
        postedBy: "AIC"
      },
      {
        title: "Caregivers Alliance Limited (CAL)",
        description: "Free training and support for mental health caregivers.",
        url: "https://www.cal.org.sg/programmes",
        image: "https://images.pexels.com/photos/7551668/pexels-photo-7551668.jpeg",
        category: "Training",
        postedBy: "CAL"
      }
    ];

    await ExternalResource.insertMany(resources);
    console.log("Real resources inserted.");
    process.exit();
  })
  .catch(err => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
