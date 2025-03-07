import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Leaf, Recycle, TrendingUp, Award } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const Learn = () => {
  const articles = [
    {
      title: 'Understanding Carbon Credits',
      description: 'Learn how carbon credits work and their impact on the environment.',
      icon: Leaf,
      category: 'Basics',
      color: 'green'
    },
    {
      title: 'Sustainable Transportation',
      description: 'Discover eco-friendly transportation options and their benefits.',
      icon: Recycle,
      category: 'Transportation',
      color: 'blue'
    },
    {
      title: 'Energy Conservation Tips',
      description: 'Simple ways to reduce your energy consumption and carbon footprint.',
      icon: Lightbulb,
      category: 'Energy',
      color: 'purple'
    },
   
  ];

  const challenges = [
    {
      title: 'Zero Waste Week',
      description: 'Challenge yourself to produce no waste for a week.',
      reward: '10 Credits',
      icon: Recycle,
      color: 'green'
    },
    {
      title: 'Public Transport Month',
      description: 'Use only public transportation for a month.',
      reward: '50 Credits',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      title: 'Energy Saver',
      description: 'Reduce your energy consumption by 20%.',
      reward: '30 Credits',
      icon: Award,
      color: 'purple'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
          }
        }}
        className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
      >
        Learn & Earn
      </motion.h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <BookOpen className="h-7 w-7 mr-3 text-green-600 dark:text-green-400" />
            Educational Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.div
                key={index}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                className={`bg-gradient-to-br from-${article.color}-50 to-${article.color}-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300`}
              >
                <div className="flex items-start">
                  <div className={`p-4 bg-gradient-to-br from-${article.color}-400 to-${article.color}-600 rounded-2xl shadow-lg`}>
                    <article.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {article.description}
                    </p>
                    <span className="inline-block mt-3 text-sm font-medium text-green-600 dark:text-green-400">
                      {article.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Leaf className="h-7 w-7 mr-3 text-green-600 dark:text-green-400" />
            Eco Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge, index) => (
              <motion.div
                key={index}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                className={`bg-gradient-to-br from-${challenge.color}-50 to-${challenge.color}-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300`}
              >
                <div className="flex items-start">
                  <div className={`p-4 bg-gradient-to-br from-${challenge.color}-400 to-${challenge.color}-600 rounded-2xl shadow-lg`}>
                    <challenge.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      {challenge.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      {challenge.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Reward: {challenge.reward}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Join Challenge
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <Lightbulb className="h-7 w-7 mr-3 text-green-600 dark:text-green-400" />
            Quick Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Use public transportation when possible',
              'Turn off lights when leaving a room',
              'Reduce, reuse, and recycle',
              'Use energy-efficient appliances',
              'Start composting at home',
              'Choose renewable energy sources'
            ].map((tip, index) => (
              <motion.div
                key={index}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <p className="ml-4 text-gray-700 dark:text-gray-300 font-medium">
                    {tip}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Learn;