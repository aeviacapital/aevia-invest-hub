import { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    // Prevent duplicate widgets
    if (window.googleTranslateElementInit) {
      return;
    }

    // Create global init function ONCE
    window.googleTranslateElementInit = () => {
      if (!document.getElementById("google_translate_container")) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,ur",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_container"
      );
    };

    // Load script ONLY if not already present
    const id = "google-translate-script";
    if (!document.getElementById(id)) {
      const script = document.createElement("script");
      script.id = id;
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div
      id="google_translate_container"
      style={{
        zIndex: 9999,
        display: "inline-block",
        transform: "scale(0.9)",
        transformOrigin: "top left",
      }}
    ></div>
  );
};

export default GoogleTranslate;

