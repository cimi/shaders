var ghpages = require("gh-pages");

ghpages.publish(
  "build",
  {
    branch: "gh-pages",
    message: "🆕 Update GitHub pages site",
    user: {
      name: "Alex Ciminian",
      email: "alex.ciminian@gmail.com"
    }
  },
  function(err) {
    if (err) {
      console.log(err);
    }
  }
);
