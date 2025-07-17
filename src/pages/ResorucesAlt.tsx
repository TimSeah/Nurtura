const resources = [
  {
    category: "Informational Articles",
    items: [
      {
        type: "Article",
        title: "Understanding Dementia Care",
        description: "Learn about the different stages of dementia and how to provide appropriate care.",
        button: "Read More",
        image: "https://images.pexels.com/photos/3791664/pexels-photo-3791664.jpeg",
      },
      {
        type: "Article",
        title: "Managing Caregiver Stress",
        description: "Strategies for managing stress and preventing burnout while caring for a loved one.",
        button: "Read More",
        image: "https://images.pexels.com/photos/3807738/pexels-photo-3807738.jpeg",
      },
    ],
  },
  {
    category: "Online Courses",
    items: [
      {
        type: "Course",
        title: "Introduction to Caregiving",
        description: "A comprehensive course covering the basics of caregiving, from personal care to medication management.",
        button: "Enroll Now",
        image: "https://images.pexels.com/photos/7551667/pexels-photo-7551667.jpeg",
      },
      {
        type: "Course",
        title: "Advanced Caregiving Techniques",
        description: "Learn advanced techniques for managing complex care needs, including mobility and communication challenges.",
        button: "Enroll Now",
        image: "https://images.pexels.com/photos/7551646/pexels-photo-7551646.jpeg",
      },
    ],
  },
];

export default function ResourcesAlt() {
  return (
    <div style={{ padding: "40px" }}>
      {resources.map((section) => (
        <div key={section.category} style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "20px" }}>
            {section.category}
          </h2>
          {section.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "30px",
                border: "3px solid #ccc",
                borderRadius: "20px",
                padding: "40px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "14px", fontWeight: "bold", color: "#888" }}>{item.type}</p>
                <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>{item.title}</h3>
                <p style={{ fontSize: "14px", marginTop: "8px", marginBottom: "60px" }}>{item.description}</p>
                <button
                  style={{
                    padding: "16px 30px",
                    fontSize: "20px",
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  {item.button}
                </button>
              </div>
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: "600px",
                  height: "337px",
                  objectFit: "contain",
                  marginLeft: "20px",
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}