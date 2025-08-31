(() => {
  const $ = id => document.getElementById(id);
  const inputs = ["name","role","email","phone","location","summary","education","experience","skills","projects"].map($);
  const photoInput = $("photo");
  const state = { photoDataURL: null };

  function refreshPreview(){
    $("pName").textContent = $("name").value.trim() || "Your Name";
    $("pRole").textContent = $("role").value.trim() || "Your Role";

    const contactBits = [
      $("email").value.trim() || "email@example.com",
      $("phone").value.trim() || "+91-0000000000",
      $("location").value.trim() || "City, Country"
    ].filter(Boolean);
    $("pContact").textContent = contactBits.join(" • ");

    $("pEducation").textContent = $("education").value.trim() || "Your education details…";
    $("pExperience").textContent = $("experience").value.trim() || "Your experience details…";

    const summary = $("summary").value.trim();
    $("secSummary").style.display = summary ? "" : "none";
    $("pSummary").textContent = summary;

    const skills = $("skills").value.trim();
    $("secSkills").style.display = skills ? "" : "none";
    $("pSkills").textContent = skills;

    const projects = $("projects").value.trim();
    $("secProjects").style.display = projects ? "" : "none";
    $("pProjects").textContent = projects;
  }

  inputs.forEach(el => el.addEventListener("input", refreshPreview));
  refreshPreview();

  // Photo upload -> preview
  photoInput.addEventListener("change", e => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.photoDataURL = reader.result;
      const holder = $("photoPreview");
      holder.innerHTML = "";
      const img = new Image();
      img.src = state.photoDataURL;
      img.alt = "profile";
      holder.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  // Reset
  $("reset").addEventListener("click", () => {
    $("resumeForm").reset();
    state.photoDataURL = null;
    $("photoPreview").innerHTML = "<span>Photo</span>";
    refreshPreview();
  });

  // Validation
  function validate(){
    const required = ["name","email","phone","education","experience"];
    for(const id of required){
      const el = $(id);
      if(!el.value.trim()){
        el.focus();
        alert("Please fill the required field: " + id);
        return false;
      }
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("email").value.trim());
    if(!emailOk){ $("email").focus(); alert("Invalid email"); return false; }
    if($("phone").value.replace(/\D/g,"").length < 7){ $("phone").focus(); alert("Invalid phone"); return false; }
    return true;
  }

  // Download PDF
  $("download").addEventListener("click", () => {
    if(!validate()) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFont("helvetica","bold"); doc.setFontSize(20);
    doc.text($("name").value.trim(), margin, margin + 10);
    doc.setFont("helvetica","normal"); doc.setFontSize(11);
    const contact = [ $("role").value.trim(), $("email").value.trim(), $("phone").value.trim(), $("location").value.trim() ]
                    .filter(Boolean).join(" • ");
    doc.text(contact, margin, margin + 28);

    // Photo top-right
    if(state.photoDataURL){
      const imgSize = 90;
      const x = pageWidth - margin - imgSize;
      const y = margin;
      doc.addImage(state.photoDataURL, "JPEG", x, y - 10, imgSize, imgSize, undefined, "FAST");
    }

    doc.setDrawColor(220);
    doc.line(margin, margin + 40, pageWidth - margin, margin + 40);

    // Sections
    let y = margin + 64;
    const maxWidth = pageWidth - margin * 2;

    function section(title, text){
      if(!text || !text.trim()) return;
      doc.setFont("helvetica","bold"); doc.setFontSize(13);
      doc.text(title.toUpperCase(), margin, y); y += 16;
      doc.setFont("helvetica","normal"); doc.setFontSize(12);
      const lines = doc.splitTextToSize(text.trim(), maxWidth);
      doc.text(lines, margin, y);
      y += lines.length * 15 + 8;
    }

    section("Summary", $("summary").value);
    section("Education", $("education").value);
    section("Experience", $("experience").value);
    section("Skills", $("skills").value);
    section("Projects", $("projects").value);

    doc.save(($("name").value.trim() || "resume") + ".pdf");
  });
})();
