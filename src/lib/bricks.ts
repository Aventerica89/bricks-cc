import type {
  BricksPage,
  BricksElement,
  BricksEditRequest,
  BricksEditResponse,
  BricksApiConfig,
  BricksPageState,
} from "@/types/bricks";

export class BricksClient {
  private config: BricksApiConfig;

  constructor(config: BricksApiConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.siteUrl}/wp-json${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Use application password authentication if available
    if (this.config.wordpressUser && this.config.applicationPassword) {
      const auth = Buffer.from(
        `${this.config.wordpressUser}:${this.config.applicationPassword}`
      ).toString("base64");
      headers["Authorization"] = `Basic ${auth}`;
    } else if (this.config.apiKey) {
      headers["X-Bricks-Api-Key"] = this.config.apiKey;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Bricks API error: ${response.status} ${response.statusText} - ${error}`
      );
    }

    return response.json();
  }

  /**
   * Get all pages with Bricks data
   */
  async getPages(): Promise<BricksPage[]> {
    return this.request<BricksPage[]>("/wp/v2/pages?_fields=id,title,slug,status,modified&per_page=100");
  }

  /**
   * Get a specific page with Bricks data
   */
  async getPage(pageId: number): Promise<BricksPage> {
    return this.request<BricksPage>(`/wp/v2/pages/${pageId}`);
  }

  /**
   * Get Bricks data for a page
   */
  async getBricksData(pageId: number): Promise<BricksElement[]> {
    const response = await this.request<{ bricks_data: BricksElement[] }>(
      `/bricks/v1/pages/${pageId}/elements`
    );
    return response.bricks_data || [];
  }

  /**
   * Update Bricks elements on a page
   */
  async updateBricksData(
    pageId: number,
    elements: BricksElement[]
  ): Promise<BricksEditResponse> {
    try {
      await this.request(`/bricks/v1/pages/${pageId}/elements`, {
        method: "POST",
        body: JSON.stringify({ bricks_data: elements }),
      });

      return {
        success: true,
        updatedElements: elements,
      };
    } catch (error) {
      return {
        success: false,
        updatedElements: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update a specific element
   */
  async updateElement(
    pageId: number,
    elementId: string,
    updates: Partial<BricksElement>
  ): Promise<BricksEditResponse> {
    const elements = await this.getBricksData(pageId);
    const elementIndex = elements.findIndex((el) => el.id === elementId);

    if (elementIndex === -1) {
      return {
        success: false,
        updatedElements: [],
        error: `Element ${elementId} not found`,
      };
    }

    elements[elementIndex] = {
      ...elements[elementIndex],
      ...updates,
      settings: {
        ...elements[elementIndex].settings,
        ...updates.settings,
      },
    };

    return this.updateBricksData(pageId, elements);
  }

  /**
   * Apply edits to a page
   */
  async applyEdits(request: BricksEditRequest): Promise<BricksEditResponse> {
    const elements = await this.getBricksData(request.pageId);

    for (const edit of request.edits) {
      const element = elements.find((el) => el.id === edit.elementId);

      if (!element) {
        continue;
      }

      // Handle nested property paths like "settings._typography.color"
      const propertyPath = edit.property.split(".");
      let target: Record<string, unknown> = element as unknown as Record<string, unknown>;

      for (let i = 0; i < propertyPath.length - 1; i++) {
        const key = propertyPath[i];
        if (typeof target[key] !== "object" || target[key] === null) {
          target[key] = {};
        }
        target = target[key] as Record<string, unknown>;
      }

      target[propertyPath[propertyPath.length - 1]] = edit.value;
    }

    return this.updateBricksData(request.pageId, elements);
  }

  /**
   * Get page state for chat context
   */
  async getPageState(pageId: number): Promise<BricksPageState> {
    const page = await this.getPage(pageId);
    const elements = await this.getBricksData(pageId);

    return {
      pageId: page.id,
      pageTitle: page.title,
      elements,
      lastModified: page.modified,
      editable: true,
    };
  }

  /**
   * Find elements by type
   */
  async findElementsByType(
    pageId: number,
    elementType: string
  ): Promise<BricksElement[]> {
    const elements = await this.getBricksData(pageId);
    return elements.filter((el) => el.name === elementType);
  }

  /**
   * Find elements by CSS class
   */
  async findElementsByClass(
    pageId: number,
    className: string
  ): Promise<BricksElement[]> {
    const elements = await this.getBricksData(pageId);
    return elements.filter((el) =>
      el.settings._cssClasses?.includes(className)
    );
  }
}

/**
 * Create a Bricks client from environment variables
 */
export function createBricksClient(siteUrl: string): BricksClient {
  const apiKey = process.env.BRICKS_API_KEY;

  return new BricksClient({
    siteUrl,
    apiKey: apiKey || "",
    wordpressUser: process.env.WORDPRESS_USER,
    applicationPassword: process.env.WORDPRESS_APP_PASSWORD,
  });
}

/**
 * Parse natural language edit requests into Bricks edits
 */
export function parseEditRequest(
  request: string,
  elements: BricksElement[]
): BricksEditRequest["edits"] {
  const edits: BricksEditRequest["edits"] = [];

  // Simple pattern matching for common requests
  // This would be enhanced by Claude's understanding

  // Color changes
  const colorMatch = request.match(
    /(?:change|make|set)\s+(?:the\s+)?(\w+)\s+(?:color\s+)?(?:to\s+)?([#\w]+)/i
  );
  if (colorMatch) {
    const [, elementType, color] = colorMatch;

    const targetElements = elements.filter((el) =>
      el.name.toLowerCase().includes(elementType.toLowerCase())
    );

    for (const el of targetElements) {
      edits.push({
        elementId: el.id,
        property: "settings._typography.color",
        value: color,
      });
    }
  }

  // Size changes
  const sizeMatch = request.match(
    /(?:make|set)\s+(?:the\s+)?(\w+)\s+(?:font\s+)?(?:size\s+)?(?:to\s+)?(\d+(?:px|rem|em)?)/i
  );
  if (sizeMatch) {
    const [, elementType, size] = sizeMatch;

    const targetElements = elements.filter((el) =>
      el.name.toLowerCase().includes(elementType.toLowerCase())
    );

    for (const el of targetElements) {
      edits.push({
        elementId: el.id,
        property: "settings._typography.font_size",
        value: size,
      });
    }
  }

  return edits;
}

export default BricksClient;
