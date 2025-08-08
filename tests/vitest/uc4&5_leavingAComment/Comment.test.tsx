import { render, screen } from "@testing-library/react";
import Comment from "../../../src/pages/forum/Comment";
import { afterEach, describe, test, expect } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const comment = {
  _id: 1,
  threadId: "thread-1",
  content: "This is a comment.",
  author: "Bob",
  date: "2023-06-01",
};

describe("Comment: UI test cases", () => {
  test("renders all comment fields correctly", () => {
    render(<Comment comment={comment} />);
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("This is a comment.")).toBeInTheDocument();
    expect(screen.getByText(/years ago/i)).toBeInTheDocument();
  });

  test("renders correct structure and classes", () => {
    render(<Comment comment={comment} />);
    const article = screen.getByRole("article");
    expect(article).toHaveClass("p-6", "text-base", "bg-white", "rounded-lg");
    expect(screen.getByText("This is a comment.")).toHaveClass(
      "text-gray-500",
      "mt-1"
    );
  });

  test("renders author and content as plain text", () => {
    render(<Comment comment={comment} />);
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("This is a comment.")).toBeInTheDocument();
  });
});

describe("Comment: boundary test cases", () => {
  test("renders with very long content", () => {
    const longContent = { ...comment, content: "A".repeat(1000) };
    render(<Comment comment={longContent} />);
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("A".repeat(1000))).toBeInTheDocument();
  });

  test("renders with very old date", () => {
    const oldDate = { ...comment, date: "2000-01-01" };
    render(<Comment comment={oldDate} />);
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText(/years ago/i)).toBeInTheDocument();
  });

  test("renders with very recent date", () => {
    const nowDate = { ...comment, date: new Date().toISOString() };
    render(<Comment comment={nowDate} />);
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(
      screen.getByText(/seconds? ago|minute ago|minutes ago/i)
    ).toBeInTheDocument();
  });
});
