// src/components/VibrantAnimatedBackground.tsx
import styles from "./AnimatedBackground.module.css";

const AnimatedBackground = () => {
  // Bubble configuration with more vibrant colors
  const bubbles = [
    {
      top: 15,
      left: 10,
      size: 40,
      delay: 0,
      color: "radial-gradient(circle, #ff6b6b, transparent 60%)",
      duration: 20,
    },
    {
      top: 30,
      left: 30,
      size: 50,
      delay: 0.5,
      color: "radial-gradient(circle, #4ecdc4, transparent 60%)",
      duration: 18,
    },
    {
      top: 60,
      left: 50,
      size: 45,
      delay: 1,
      color: "radial-gradient(circle, #ffd166, transparent 60%)",
      duration: 22,
    },
    {
      top: 75,
      left: 70,
      size: 55,
      delay: 1.5,
      color: "radial-gradient(circle, #6a0572, transparent 60%)",
      duration: 25,
    },
    {
      top: 85,
      left: 90,
      size: 35,
      delay: 2,
      color: "radial-gradient(circle, #1a936f, transparent 60%)",
      duration: 17,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.base}></div>
      <div className={styles.bubbleContainer}>
        {bubbles.map((bubble, i) => (
          <div
            key={i}
            className={styles.bubble}
            style={{
              top: `${bubble.top}%`,
              left: `${bubble.left}%`,
              width: `${bubble.size}vw`,
              height: `${bubble.size}vw`,
              background: bubble.color,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
              opacity: 0.7, // Increased opacity for more visibility
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AnimatedBackground;
