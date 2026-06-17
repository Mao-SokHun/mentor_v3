import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import "dotenv/config";

const port = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RokKru Backend API Documentation",
      version: "1.0.0",
      description:
        "API Documentation for RokKru - v5 DEMO Final with JWT Sessions",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        UserType: {
          type: "object",
          properties: {
            user_type_id: {
              type: "integer",
              description: "The unique identifier for the user type",
            },
            user_type_name: {
              type: "string",
              description:
                "The name of the user type/role (e.g. Student, Mentor, Admin)",
            },
            create_date: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user type was created",
            },
            update_date: {
              type: "string",
              format: "date-time",
              description: "Timestamp when the user type was last updated",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "user_type"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", minLength: 8, example: "SecurePass123!" },
            user_type: { type: "integer", example: 1 },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", example: "SecurePass123!" },
          },
        },
        OTPVerifyRequest: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            otp: { type: "string", example: "123456" },
          },
        },
        OTPVerifyResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "login success" },
            user: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                email: { type: "string", example: "user@example.com" },
                user_type: { type: "integer", example: 1 },
              },
            },
          },
        },
        ResetPasswordRequest: {
          type: "object",
          required: ["oldPassword", "newPassword"],
          properties: {
            oldPassword: { type: "string" },
            newPassword: { type: "string", minLength: 8 },
          },
        },
        ForgotPasswordRequest: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
          },
        },
        SetNewPasswordRequest: {
          type: "object",
          required: ["email", "newPassword"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            newPassword: { type: "string", minLength: 8 },
          },
        },
        ProfileResponse: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", example: "user@example.com" },
            status: { type: "string", example: "active" },
            role: { type: "string", example: "Student" },
          },
        },
        MessageResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        MentorApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
          },
        },
        MentorApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Portfolio item not found" },
          },
        },
        PortfolioFile: {
          type: "object",
          properties: {
            file_id: { type: "integer", example: 1 },
            mentor_id: { type: "integer", example: 136 },
            portfolio_link: {
              type: "string",
              example: "https://github.com/mentor/my-project",
            },
            file_name: { type: "string", example: "certificate.pdf" },
            mime_type: {
              type: "string",
              enum: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
              example: "application/pdf",
            },
            file_size: { type: "integer", example: 245760 },
            url: {
              type: "string",
              example: "http://localhost:3000/api/v1/portfolio-files/136/1710000000-abc123.pdf",
            },
            create_date: { type: "string", format: "date-time" },
          },
        },
        PortfolioItem: {
          type: "object",
          properties: {
            mentor_id: { type: "integer", example: 136 },
            link: {
              type: "string",
              example: "https://github.com/mentor/my-project",
            },
            link_tag: { type: "string", example: "React Dashboard" },
            description: {
              type: "string",
              example: "Built a student analytics dashboard with React and Node.",
            },
            portfolio_date: { type: "string", format: "date", example: "2025-06-15" },
            technologies: {
              type: "array",
              items: { type: "string" },
              example: ["React", "Node.js", "PostgreSQL"],
            },
            item_type: {
              type: "string",
              enum: ["link", "project", "certificate", "achievement"],
              example: "project",
            },
            sort_order: { type: "integer", example: 0 },
            files: {
              type: "array",
              items: { $ref: "#/components/schemas/PortfolioFile" },
            },
          },
        },
        PortfolioCreateRequest: {
          type: "object",
          required: ["link"],
          properties: {
            link: {
              type: "string",
              format: "uri",
              example: "https://github.com/mentor/my-project",
              description: "Required http(s) URL. Max 250 chars. Unique per mentor.",
            },
            link_tag: { type: "string", example: "React Dashboard" },
            title: {
              type: "string",
              example: "React Dashboard",
              description: "Alias for link_tag",
            },
            description: { type: "string", example: "Portfolio project description." },
            portfolio_date: {
              type: "string",
              format: "date",
              example: "2025-06-15",
            },
            technologies: {
              oneOf: [
                { type: "array", items: { type: "string" } },
                { type: "string", example: "React, Node.js" },
              ],
            },
            item_type: {
              type: "string",
              enum: ["link", "project", "certificate", "achievement"],
              example: "project",
            },
            sort_order: { type: "integer", example: 0 },
          },
        },
        PortfolioUpdateRequest: {
          type: "object",
          properties: {
            link_tag: { type: "string", example: "Updated title" },
            title: { type: "string", example: "Updated title" },
            description: { type: "string", example: "Updated description." },
            portfolio_date: { type: "string", format: "date", example: "2025-07-01" },
            technologies: {
              oneOf: [
                { type: "array", items: { type: "string" } },
                { type: "string", example: "React, TypeScript" },
              ],
            },
            item_type: {
              type: "string",
              enum: ["link", "project", "certificate", "achievement"],
            },
            sort_order: { type: "integer", example: 1 },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT session cookie set by POST /api/v1/auth/login",
        },
      },
    },
  },
  apis: ["./routes/**/*.js", "./app.js", "./routes/v1/**/*.js"], // Paths to files with swagger comments
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(
    `📑 Swagger Documentation available at http://localhost:${port}/api-docs`,
  );
}

export default setupSwagger;
