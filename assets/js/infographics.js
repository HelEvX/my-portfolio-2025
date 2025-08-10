class SkillsInitializer {
  constructor() {
    this.initializeAllSkills();
    window.addEventListener("resize", () => this.handleResize());
  }

  initializeAllSkills() {
    // Find all skills containers and initialize based on their classes
    document.querySelectorAll(".skills").forEach((skillsContainer) => {
      if (skillsContainer.classList.contains("dotted")) {
        this.initializeDottedSkills(skillsContainer);
      } else if (skillsContainer.classList.contains("circles")) {
        this.initializeCircleSkills(skillsContainer);
      } else if (!skillsContainer.classList.contains("list")) {
        this.initializeLineSkills(skillsContainer);
      }
    });
  }

  initializeLineSkills(container) {
    const progressBars = container.querySelectorAll(".progress");

    progressBars.forEach((progressBar) => {
      const li = progressBar.closest("li");
      const percentage = parseInt(li.getAttribute("data-percentage"));
      const percentageDiv = progressBar.querySelector(".percentage");

      percentageDiv.style.width = percentage + "%";
    });
  }

  initializeDottedSkills(container) {
    const progressBars = container.querySelectorAll(".progress");

    progressBars.forEach((progressBar) => {
      const progressWidth = progressBar.offsetWidth;
      const li = progressBar.closest("li");
      const percentage = parseInt(li.getAttribute("data-percentage"));

      // Create background dots (dg) if not exists
      if (!progressBar.querySelector(".dg")) {
        const dg = document.createElement("span");
        dg.className = "dg";
        for (let i = 0; i < 10; i++) {
          const dot = document.createElement("span");
          dg.appendChild(dot);
        }
        progressBar.appendChild(dg);
      }

      // Create active dots (da) inside percentage div if not exists
      const percentageDiv = progressBar.querySelector(".percentage");
      if (!percentageDiv.querySelector(".da")) {
        const da = document.createElement("span");
        da.className = "da";

        // Calculate how many dots should be active
        const activeDots = Math.round((percentage / 100) * 10);
        for (let i = 0; i < 10; i++) {
          const dot = document.createElement("span");
          if (i < activeDots) {
            dot.style.background = "#f26b38"; // Primary color
          } else {
            dot.style.background = "transparent";
          }
          da.appendChild(dot);
        }

        percentageDiv.appendChild(da);
      }

      // Set width for proper spacing
      const da = percentageDiv.querySelector(".da");
      if (da) {
        da.style.width = progressWidth + "px";
      }
      percentageDiv.style.width = percentage + "%";
    });
  }

  initializeCircleSkills(container) {
    const progressBars = container.querySelectorAll(".progress");

    progressBars.forEach((progressBar) => {
      const li = progressBar.closest("li");
      const percentage = parseInt(li.getAttribute("data-percentage"));

      // Add percentage class for CSS styling
      progressBar.classList.add(`p${percentage}`);

      // Set width on the percentage div
      const percentageDiv = progressBar.querySelector(".percentage");
      if (percentageDiv) {
        percentageDiv.style.width = percentage + "%";
      }

      // Create slice structure if not exists - using appendChild like the jQuery version
      if (!progressBar.querySelector(".slice")) {
        const slice = document.createElement("div");
        slice.className = "slice";

        const bar = document.createElement("div");
        bar.className = "bar";

        const fill = document.createElement("div");
        fill.className = "fill";

        slice.appendChild(bar);
        slice.appendChild(fill);
        progressBar.appendChild(slice);
      }
    });
  }

  handleResize() {
    // Recalculate dotted progress widths on resize
    document
      .querySelectorAll(".skills.dotted .progress")
      .forEach((progressBar) => {
        const da = progressBar.querySelector(".percentage .da");
        if (da) {
          da.style.width = progressBar.offsetWidth + "px";
        }
      });
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SkillsInitializer();
});
