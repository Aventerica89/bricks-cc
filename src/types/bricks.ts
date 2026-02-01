export interface BricksPage {
  id: number;
  title: string;
  slug: string;
  status: string;
  template: string;
  bricks_data: BricksElement[];
  modified: string;
}

export interface BricksElement {
  id: string;
  name: string;
  parent: number;
  children: string[];
  settings: BricksElementSettings;
  label?: string;
}

export interface BricksElementSettings {
  _cssClasses?: string;
  _cssId?: string;
  _hidden?: boolean;
  _margin?: BricksSpacing;
  _padding?: BricksSpacing;
  _typography?: BricksTypography;
  _background?: BricksBackground;
  _border?: BricksBorder;
  _boxShadow?: BricksBoxShadow;
  [key: string]: unknown;
}

export interface BricksSpacing {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface BricksTypography {
  font_family?: string;
  font_size?: string;
  font_weight?: string;
  line_height?: string;
  letter_spacing?: string;
  text_align?: string;
  text_transform?: string;
  text_decoration?: string;
  color?: string;
}

export interface BricksBackground {
  color?: string;
  image?: BricksImage;
  gradient?: string;
  overlay?: string;
}

export interface BricksImage {
  id?: number;
  url?: string;
  size?: string;
  position?: string;
  repeat?: string;
  attachment?: string;
}

export interface BricksBorder {
  width?: string;
  style?: string;
  color?: string;
  radius?: BricksSpacing | string;
}

export interface BricksBoxShadow {
  color?: string;
  horizontal?: string;
  vertical?: string;
  blur?: string;
  spread?: string;
  inset?: boolean;
}

export interface BricksEditRequest {
  siteId: string;
  pageId: number;
  edits: BricksEdit[];
}

export interface BricksEdit {
  elementId: string;
  property: string;
  value: unknown;
}

export interface BricksEditResponse {
  success: boolean;
  updatedElements: BricksElement[];
  error?: string;
}

export interface BricksApiConfig {
  siteUrl: string;
  apiKey: string;
  wordpressUser?: string;
  applicationPassword?: string;
}

export interface BricksPageState {
  pageId: number;
  pageTitle: string;
  elements: BricksElement[];
  lastModified: string;
  editable: boolean;
}
