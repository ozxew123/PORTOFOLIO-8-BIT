const expertise = [
  {icon:"▣",title:"Game Developer",desc:"Turning ideas into interactive worlds through gameplay mechanics, immersive storylines, and engaging digital experiences."},
  {icon:"✦",title:"Design",desc:"Crafting visually striking, responsive, and human-centered digital interfaces."},
  {icon:"⌘",title:"UI/UX DESIGN",desc:"Transforming ideas into intuitive interfaces where aesthetic pixel art meets seamless user journeys."}
];

const expertiseGrid=document.getElementById("expertise-grid");
expertiseGrid.innerHTML=expertise.map((c,i)=>`
  <article class="expertise-card reveal" style="transition-delay:${i*.12}s">
    <span class="corner"></span><span class="corner"></span><span class="corner"></span><span class="corner"></span>
    <div class="expertise-icon">${c.icon}</div>
    <h3>${c.title}</h3>
    <p>${c.desc}</p>
  </article>`).join("");

// Background stars generator
const bg=document.getElementById("pixel-background");
for(let i=0;i<70;i++){
  const star=document.createElement("span");
  star.className="star";
  star.style.left=`${Math.random()*100}%`;
  star.style.top=`${Math.random()*100}%`;
  star.style.opacity=(Math.random()*.5+.1).toFixed(2);
  star.style.width=star.style.height=Math.random()>.8?"8px":"4px";
  star.style.animationDuration=`${Math.random()*15+15}s`;
  star.style.animationDelay=`${Math.random()*-20}s`;
  bg.appendChild(star);
}

const navbar=document.getElementById("navbar");
window.addEventListener("scroll",()=>navbar.classList.toggle("scrolled",window.scrollY>50));

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting) entry.target.classList.add("visible")});
},{threshold:.12});
document.querySelectorAll(".reveal,.reveal-left,.reveal-right").forEach(el=>observer.observe(el));

document.getElementById("year").textContent=new Date().getFullYear();

document.getElementById("menu-btn").addEventListener("click",()=>{
  document.querySelector(".nav-links").classList.toggle("mobile-open");
});
document.querySelector(".nav-links").addEventListener("click",e=>{
  if(e.target.tagName==="A") document.querySelector(".nav-links").classList.remove("mobile-open");
});

// Skill Tree Data
const skillsData = [
  {
    category: "FRONTEND",
    desc: "Visual & Interface",
    skills: [
      { name: "HTML", level: 90 },
      { name: "CSS", level: 85 },
      { name: "TAILWIND", level: 80 },
      { name: "JAVASCRIPT", level: 75 }
    ]
  },
  {
    category: "BACKEND",
    desc: "Server & Logic",
    skills: [
      { name: "PYTHON", level: 70 },
      { name: "NODE.JS", level: 65 },
      { name: "GOLANG", level: 50 }
    ]
  },
  {
    category: "DATABASE",
    desc: "Data Storage",
    skills: [
      { name: "MYSQL", level: 80 },
      { name: "POSTGRESQL", level: 60 },
      { name: "MONGODB", level: 55 }
    ]
  },
  {
    category: "DESIGN",
    desc: "UI/UX & Assets",
    skills: [
      { name: "FIGMA", level: 85 },
      { name: "PIXEL ART", level: 75 },
      { name: "PHOTOSHOP", level: 70 }
    ]
  }
];

// Render Skills Grid
const skillsGrid = document.getElementById("skills-grid");
skillsGrid.innerHTML = skillsData.map((data, i) => `
  <article class="skill-card reveal" style="transition-delay:${i * 0.1}s" data-index="${i}">
    <h3>${data.category}</h3>
    <p>${data.desc}</p>
    <div style="margin-top: 16px; font-size: 10px; color: var(--primary); font-family: var(--pixel);">CLICK TO VIEW ></div>
  </article>
`).join("");

document.querySelectorAll(".skill-card.reveal").forEach(el => observer.observe(el));

// Modal Script Logic untuk Skills
const skillModal = document.getElementById("skill-modal");
const skillModalClose = document.getElementById("skill-modal-close");
const skillModalTitle = document.getElementById("skill-modal-title");
const skillBarsContainer = document.getElementById("skill-bars-container");

document.querySelectorAll(".skill-card").forEach(card => {
  card.addEventListener("click", () => {
    const index = card.getAttribute("data-index");
    const skillCategory = skillsData[index];

    skillModalTitle.textContent = skillCategory.category;
    skillBarsContainer.innerHTML = skillCategory.skills.map(skill => `
      <div class="skill-row">
        <div class="skill-info">
          <span>${skill.name}</span>
          <span class="skill-level-text">LVL ${skill.level}</span>
        </div>
        <div class="skill-bar-bg">
          <div class="skill-bar-fill" id="fill-${skill.name.replace(/\s+/g, '')}" style="width: 0%;"></div>
        </div>
      </div>
    `).join("");

    skillModal.classList.add("active");

    setTimeout(() => {
      skillCategory.skills.forEach(skill => {
        const fillBar = document.getElementById(`fill-${skill.name.replace(/\s+/g, '')}`);
        if (fillBar) {
          fillBar.style.width = `${skill.level}%`;
        }
      });
    }, 100);
  });
});

const closeSkillModal = () => {
  skillModal.classList.remove("active");
  setTimeout(() => {
    skillBarsContainer.innerHTML = "";
  }, 300);
};

skillModalClose.addEventListener("click", closeSkillModal);
skillModal.addEventListener("click", (e) => {
  if (e.target === skillModal) closeSkillModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSkillModal();
});

// Penanganan Form dengan metode Mailto
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Mencegah reload halaman
    
    // Mengambil nilai dari input form
    const name = document.getElementById("player-name").value.trim();
    const email = document.getElementById("player-email").value.trim();
    const message = document.getElementById("player-message").value.trim();
    
    // Menyusun subjek dan isi email
    const subject = encodeURIComponent(`New Quest from ${name}`);
    const body = encodeURIComponent(`Player Name: ${name}\nEmail: ${email}\n\nMessage/Quest:\n${message}`);
    
    // Membuka aplikasi email bawaan pengguna
    window.location.href = `mailto:hikmal.ramadhan2004@gmail.com?subject=${subject}&body=${body}`;
  });
}