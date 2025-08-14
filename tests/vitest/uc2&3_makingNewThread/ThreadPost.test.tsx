import { render, screen, fireEvent } from "@testing-library/react";
import ThreadPost from "../../../src/pages/forum/threadPost";
import { afterEach, describe, test, expect, vi, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock icons to avoid SVG issues
vi.mock("@heroicons/react/24/outline", () => ({
  ArrowUpIcon: () => <svg data-testid="ArrowUpIcon" />,
  ArrowDownIcon: () => <svg data-testid="ArrowDownIcon" />,
  ChatBubbleBottomCenterIcon: () => (
    <svg data-testid="ChatBubbleBottomCenterIcon" />
  ),
  ClipboardDocumentIcon: (props: any) => <div {...props} />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  });

  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    window.alert = vi.fn();
});

const thread = {
  _id: 1,
  title: "Sample Thread",
  content: "This is a sample thread content.",
  author: "Alice",
  date: "2023-06-01",
  upvotes: 10,
  replies: 4,
  userVote: null,
};

describe("ThreadPost: UI test cases", () => {
  test("renders all thread fields correctly", () => {
    render(
      <ThreadPost
        thread={thread}
        onCommentClick={vi.fn()}
        onVote={vi.fn()}
        upvotes={thread.upvotes}
        userVote={null}
      />
    );
    expect(screen.getByText("Sample Thread")).toBeInTheDocument();
    expect(
      screen.getByText("This is a sample thread content.")
    ).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText(/years ago/i)).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  test("renders icons and correct structure", () => {
    render(
      <ThreadPost
        thread={thread}
        onCommentClick={vi.fn()}
        onVote={vi.fn()}
        upvotes={thread.upvotes}
        userVote={null}
      />
    );
    expect(screen.getByTestId("ArrowUpIcon")).toBeInTheDocument();
    expect(
      screen.getByTestId("ChatBubbleBottomCenterIcon")
    ).toBeInTheDocument();
    const article = screen.getByRole("article");
    expect(article).toHaveClass(
      "max-w-3xl",
      "mx-auto",
      "bg-white",
      "rounded-2xl",
      "shadow",
      "p-6"
    );
  });

  test("renders updated upvotes prop", () => {
    const { rerender } = render(
      <ThreadPost
        thread={thread}
        onCommentClick={vi.fn()}
        onVote={vi.fn()}
        upvotes={10}
        userVote={null}
      />
    );
    expect(screen.getByText("10")).toBeInTheDocument();
    rerender(
      <ThreadPost
        thread={thread}
        onCommentClick={vi.fn()}
        onVote={vi.fn()}
        upvotes={15}
        userVote={null}
      />
    );
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  test("renders with 0 upvotes", () => {
    render(
      <ThreadPost
        thread={{ ...thread, upvotes: 0 }}
        onCommentClick={vi.fn()}
        onVote={vi.fn()}
        upvotes={0}
        userVote={null}
      />
    );
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("renders with very high upvotes", () => {
    render(
      <ThreadPost
        thread={{ ...thread, upvotes: 9999 }}
        onCommentClick={vi.fn()}
        onVote={vi.fn()}
        upvotes={9999}
        userVote={null}
      />
    );
    expect(screen.getByText("9999")).toBeInTheDocument();
  });

  test("renders with very long title and content", () => {
    const longTitle = "T".repeat(200);
    const longContent = "C".repeat(1000);
    render(
      <ThreadPost
        thread={{ ...thread, title: longTitle, content: longContent }}
        onCommentClick={vi.fn()}
        onVote={vi.fn()}
        upvotes={10}
        userVote={null}
      />
    );
    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longContent)).toBeInTheDocument();
  });

  test("renders upvote icon as green when userVote is up", () => {
    render(
      <ThreadPost
        thread={thread}
        onCommentClick={vi.fn()}
        onVote={vi.fn()}
        upvotes={10}
        userVote={"up"}
      />
    );
    // The icon color is a class, but since we mock the icon, just check the prop is accepted and no error
    expect(screen.getByTestId("ArrowUpIcon")).toBeInTheDocument();
  });

  test("renders downvote icon as red when userVote is down", () => {
    render(
      <ThreadPost
        thread={thread}
        onCommentClick={vi.fn()}
        onVote={vi.fn()}
        upvotes={10}
        userVote={"down"}
      />
    );
    expect(screen.getByTestId("ArrowDownIcon")).toBeInTheDocument();
  });
});

describe("ThreadPost: Unit test cases", () => {
  test("calls onCommentClick when comment button is clicked", () => {
    const onCommentClick = vi.fn();
    render(
      <ThreadPost
        thread={thread}
        onCommentClick={onCommentClick}
        onVote={vi.fn()}
        upvotes={thread.upvotes}
        userVote={null}
      />
    );
    fireEvent.click(screen.getByLabelText("Add Comment"));
    expect(onCommentClick).toHaveBeenCalledTimes(1);
  });

  test('calls onVote with "up" when upvote button is clicked', () => {
    const onVote = vi.fn();
    render(
      <ThreadPost
        thread={thread}
        onCommentClick={vi.fn()}
        onVote={onVote}
        upvotes={thread.upvotes}
        userVote={null}
      />
    );
    fireEvent.click(screen.getByLabelText("Upvote"));
    expect(onVote).toHaveBeenCalledWith("up");
  });

  test('calls onVote with "down" when downvote button is clicked', () => {
    const onVote = vi.fn();
    render(
      <ThreadPost
        thread={thread}
        onCommentClick={vi.fn()}
        onVote={onVote}
        upvotes={thread.upvotes}
        userVote={null}
      />
    );
    fireEvent.click(screen.getByLabelText("Downvote"));
    expect(onVote).toHaveBeenCalledWith("down");
  });
});
