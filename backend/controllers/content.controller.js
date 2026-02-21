export const getHomeContent = (req, res) => {
  res.json({
    title: "Welcome to Pregnancy Care",
    description:
      "Track your pregnancy journey with safe, reliable guidance."
  });
};

export const getAboutContent = (req, res) => {
  res.json({
    about:
      "Pregnancy Care is built to provide general guidance and tracking tools.",
    disclaimer:
      "This platform does not replace professional medical advice."
  });
};
