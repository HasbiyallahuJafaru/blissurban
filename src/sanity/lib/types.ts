export type SanityImage = { asset?: { _ref?: string }; alt?: string } | null;

export type Room = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  capacity: number;
  size?: string;
  bed?: string;
  amenities: string[];
  description: string;
  image: SanityImage;
  images?: SanityImage[];
  /** Unsplash ids, used only until real photography exists. */
  photo?: string;
  gallery?: string[];
  featured?: boolean;
  available: boolean;
};

export type Section = "restaurant" | "lounge";

export type MenuItem = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  section: Section;
  tags?: string[];
  image: SanityImage;
  available: boolean;
};

export type Amenity = { title: string; body: string; icon: string };

export type SiteSettings = {
  phone: string;
  phoneAlt?: string;
  email: string;
  whatsapp: string;
  address: string;
  hours: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroHeadlineItalic: string;
  heroBody: string;
  heroImage: SanityImage;
  amenities: Amenity[];
  promoEyebrow: string;
  promoHeading: string;
  promoBody: string;
  promoCtaLabel: string;
  promoCtaHref: string;
};
