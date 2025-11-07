const findMatches = (currentUserSkills, allSkills) => {
  const matches = [];

  allSkills.forEach((other) => {
    if (other.user._id.toString() !== currentUserSkills.user._id.toString()) {
      const otherTeach = other.teachSkills.map((s) => s.name.toLowerCase());
      const otherLearn = other.learnSkills.map((s) => s.name.toLowerCase());
      const currentTeach = currentUserSkills.teachSkills.map((s) => s.name.toLowerCase());
      const currentLearn = currentUserSkills.learnSkills.map((s) => s.name.toLowerCase());

      // ✅ Mutual Swap Condition (both have something to exchange)
      const mutual =
        otherTeach.some((t) => currentLearn.includes(t)) &&
        otherLearn.some((l) => currentTeach.includes(l));

      if (mutual) {
        matches.push(other);
      }
    }
  });

  // Remove duplicate users by their _id
  return [...new Map(matches.map((m) => [m.user._id.toString(), m])).values()];
};

export default findMatches;
