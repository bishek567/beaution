// Import premium local makeup photography assets
import heroMakeup from "../assets/images/hero_makeup_model_1781698921586.jpg";
import bridalMakeup from "../assets/images/bridal_makeup_1781698939425.jpg";
import glamMakeup from "../assets/images/glam_makeup_1781698956084.jpg";
import makeupSetup from "../assets/images/makeup_setup_1781698971117.jpg";

export const IMAGE_MAP: { [key: string]: string } = {
  hero_makeup_model: heroMakeup,
  bridal_makeup: bridalMakeup,
  glam_makeup: glamMakeup,
  makeup_setup: makeupSetup,
};

export function getServiceImage(key: string): string {
  if (IMAGE_MAP[key]) {
    return IMAGE_MAP[key];
  }
  // Fallbacks using picsum placeholders for custom user created entries
  if (key === "airbrush_hd") return bridalMakeup;
  return `https://picsum.photos/seed/${key || "makeup"}/600/450`;
}
