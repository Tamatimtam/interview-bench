// Problem Registry & Loader
// Collects modular problem files and provides helper methods

window.PROBLEMS = [];

window.REGISTER_PROBLEM = function (problem) {
  if (!problem || !problem.id) {
    console.error("Invalid problem registration: missing id", problem);
    return;
  }
  
  // Check for duplicates
  const existingIdx = window.PROBLEMS.findIndex(p => p.id === problem.id);
  if (existingIdx >= 0) {
    window.PROBLEMS[existingIdx] = problem;
  } else {
    window.PROBLEMS.push(problem);
  }
};

window.GET_CATEGORIES = function () {
  const categories = new Set(["All"]);
  window.PROBLEMS.forEach(p => {
    if (p.category) categories.add(p.category);
  });
  return Array.from(categories);
};
