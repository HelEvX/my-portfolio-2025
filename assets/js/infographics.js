class SkillsInitializer {
  constructor() {
    this.skillLevels = {
      90: "Expert - Extensive professional experience, can mentor others",
      80: "Advanced - Highly proficient, can handle complex projects independently",
      70: "Proficient - Strong working knowledge, comfortable with most tasks",
      60: "Intermediate - Good understanding, can complete standard tasks",
      50: "Developing - Basic competency, learning and improving",
      40: "Beginner - Some experience, requires guidance",
      30: "Novice - Limited experience, still learning fundamentals",
      20: "Basic - Minimal experience, requires significant support",
      10: "Awareness - Familiar with concepts but limited practical experience",
    };

    this.initializeAllSkills();
    this.addSkillTooltips();
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

  getSkillDescription(percentage) {
    // Find the closest match in our skill levels
    const levels = Object.keys(this.skillLevels)
      .map(Number)
      .sort((a, b) => b - a);
    const closestLevel =
      levels.find((level) => percentage >= level) || levels[levels.length - 1];
    return this.skillLevels[closestLevel];
  }

  addSkillTooltips() {
    // Debug: Check if we can find the elements
    const dottedSkills = document.querySelectorAll(".skills.dotted");
    const skillItems = document.querySelectorAll(".skills.dotted li");

    //console.log("Found dotted skills containers:", dottedSkills.length);
    //console.log("Found skill items:", skillItems.length);

    // Add instruction text
    dottedSkills.forEach((container) => {
      if (!container.querySelector(".skill-instruction")) {
        const instruction = document.createElement("div");
        instruction.className = "skill-instruction";
        instruction.style.cssText =
          "font-size: 12px; color: var(--color-light-text);; margin-bottom: 10px; margin-top: -20px; font-family: ivystyle-sans; font-style: italic; text-align: right;";
        instruction.textContent = "Hover over skills for detailed explanations";

        const ul = container.querySelector("ul");
        if (ul) {
          container.insertBefore(instruction, ul);
        } else {
          container.appendChild(instruction);
        }
      }
    });

    // Add tooltips to skill items
    skillItems.forEach((li, index) => {
      const percentage = parseInt(li.getAttribute("data-percentage"));
      //console.log(`Processing skill ${index}: ${percentage}%`);

      if (isNaN(percentage)) {
        console.warn("Invalid percentage for skill item:", li);
        return;
      }

      const description = this.getSkillDescription(percentage);
      //console.log(`Description for ${percentage}%:`, description);

      // Create tooltip element
      if (!li.querySelector(".skill-tooltip")) {
        const tooltip = document.createElement("div");
        tooltip.className = "skill-tooltip";
        tooltip.textContent = description;
        tooltip.style.cssText = `
          position: absolute;
          background: var(--color-text);
          font-family: 'ivystyle-sans', sans-serif;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.05em;
          max-width: 250px;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s, visibility 0.3s;
          pointer-events: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;

        // Make sure li has relative positioning
        li.style.position = "relative";
        li.appendChild(tooltip);

        //console.log("Tooltip added to skill item:", li);
      }

      const tooltip = li.querySelector(".skill-tooltip");

      // Desktop hover events
      li.addEventListener("mouseenter", (e) => {
        tooltip.style.opacity = "1";
        tooltip.style.visibility = "visible";
        tooltip.style.bottom = "100%";
        tooltip.style.right = "30px";
        tooltip.style.marginBottom = "-20px";
      });

      li.addEventListener("mouseleave", (e) => {
        tooltip.style.opacity = "0";
        tooltip.style.visibility = "hidden";
      });

      // Mobile/tablet touch events
      li.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Prevent mouse events on touch

        // Hide other tooltips first
        document.querySelectorAll(".skill-tooltip").forEach((t) => {
          if (t !== tooltip) {
            t.style.opacity = "0";
            t.style.visibility = "hidden";
          }
        });

        // Toggle this tooltip
        const isVisible = tooltip.style.opacity === "1";
        tooltip.style.opacity = isVisible ? "0" : "1";
        tooltip.style.visibility = isVisible ? "hidden" : "visible";
        tooltip.style.bottom = "100%";
        tooltip.style.left = "0";
        tooltip.style.marginBottom = "8px";
      });
    });

    // Hide tooltips when tapping elsewhere on mobile
    document.addEventListener("touchstart", (e) => {
      if (!e.target.closest(".skills.dotted li")) {
        document.querySelectorAll(".skill-tooltip").forEach((tooltip) => {
          tooltip.style.opacity = "0";
          tooltip.style.visibility = "hidden";
        });
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
            dot.style.background = "var(--color-primary)";
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
