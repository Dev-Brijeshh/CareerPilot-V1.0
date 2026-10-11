const skillsList = [
  "JavaScript",
  "React",
  "Node.js",
  "Express",
  "MongoDB",
  "HTML",
  "CSS",
  "Java",
  "Python",
  "C++",
  "SQL",
  "Git",
  "GitHub",
  "Machine Learning",
  "Data Analysis",
];

const extractSkills = (text) => {
  const foundSkills = [];

  skillsList.forEach((skill) => {
    const regex = new RegExp(`\\b${skill.replace("+", "\\+")}\\b`, "i");

    if (regex.test(text)) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
};

module.exports = extractSkills;
