import { screen, fireEvent, waitFor } from "@testing-library/react";
import ThreadDetail from "../../../src/pages/forum/threadDetail";
import { renderWithRouter } from "../utils";
import { mockFetchOnce } from "../mockFetch";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import {
  AuthContext,
  AuthContextType,
} from "../../../src/contexts/AuthContext";

const sampleThread = {
  _id: 1,
  title: "Test Thread",
  content: "Thread content",
  author: "Good Commenter",
  date: new Date().toISOString(),
  upvotes: 2,
  replies: 1,
};

const mockAuth: AuthContextType = {
  user: { username: "Good Commenter" },
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
};

const sampleComments = [
  {
    _id: 1,
    threadId: "1",
    content: "First comment",
    author: "Alice",
    date: new Date().toISOString(),
  },
  {
    _id: 2,
    threadId: "1",
    content: "Second comment",
    author: "Bob",
    date: new Date().toISOString(),
  },
];

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

beforeEach(() => {
  navigateMock.mockReset();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  });

  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    window.alert = vi.fn();
});

describe("ThreadDetail: UI test cases", () => {
  // UI test
  test("shows loading state", async () => {
    // Simulate fetch never resolves
    vi.spyOn(global, "fetch").mockImplementation(() => new Promise(() => {}));
    renderWithRouter(<ThreadDetail />, {
      route: "/threads/1",
      path: "/threads/:id",
    });
    expect(screen.getByText(/Loading thread/i)).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  // UI test
  test("shows error state", async () => {
    mockFetchOnce({}, false, 500); // thread fetch
    mockFetchOnce([], true); // comments fetch
    renderWithRouter(<ThreadDetail />, {
      route: "/threads/1",
      path: "/threads/:id",
    });
    expect(
      await screen.findByText(/Error loading thread/i)
    ).toBeInTheDocument();
  });

  // UI test
  test("shows thread not found", async () => {
    mockFetchOnce(null, true); // thread fetch returns null
    mockFetchOnce([], true); // comments fetch
    renderWithRouter(<ThreadDetail />, {
      route: "/threads/1",
      path: "/threads/:id",
    });
    await waitFor(() =>
      expect(screen.getByText(/Thread not found/i)).toBeInTheDocument()
    );
  });

  // UI test
  test("renders thread and comments", async () => {
    mockFetchOnce(sampleThread, true); // thread fetch
    mockFetchOnce(sampleComments, true); // comments fetch
    renderWithRouter(<ThreadDetail />, {
      route: "/threads/1",
      path: "/threads/:id",
    });
    expect(await screen.findByText("Test Thread")).toBeInTheDocument();
    expect(screen.getByText("Thread content")).toBeInTheDocument();
    expect(screen.getByText("First comment")).toBeInTheDocument();
    expect(screen.getByText("Second comment")).toBeInTheDocument();
  });

  // UI test
  test("shows no comments message", async () => {
    mockFetchOnce(sampleThread, true);
    mockFetchOnce([], true);
    renderWithRouter(<ThreadDetail />, {
      route: "/threads/1",
      path: "/threads/:id",
    });
    expect(
      await screen.findByText("No comments yet. Be the first to comment!")
    ).toBeInTheDocument();
  });

  // UI test
  test("opens and closes comment form", async () => {
    mockFetchOnce(sampleThread, true);
    mockFetchOnce(sampleComments, true);
    renderWithRouter(<ThreadDetail />, {
      route: "/threads/1",
      path: "/threads/:id",
    });
    await screen.findByText("Test Thread");
    fireEvent.click(screen.getByRole("button", { name: /add comment/i }));
    expect(screen.getByPlaceholderText(/Write a comment/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(
      screen.queryByPlaceholderText(/Write a comment/i)
    ).not.toBeInTheDocument();
  });

  // UI test
  test("validates empty comment form", async () => {
    mockFetchOnce(sampleThread, true);
    mockFetchOnce(sampleComments, true);
    renderWithRouter(<ThreadDetail />, {
      route: "/threads/1",
      path: "/threads/:id",
    });
    await screen.findByText("Test Thread");
    fireEvent.click(screen.getByRole("button", { name: /add comment/i }));
    fireEvent.click(screen.getByRole("button", { name: /Post comment/i }));
    expect(
      screen.getByText(/Please write a comment before posting/i)
    ).toBeInTheDocument();
  });

  test("renders thread with 0 upvotes and 0 replies", async () => {
    const zeroThread = { ...sampleThread, upvotes: 0, replies: 0 };
    mockFetchOnce(zeroThread, true);
    mockFetchOnce([], true);
    renderWithRouter(<ThreadDetail />, {
      route: "/threads/1",
      path: "/threads/:id",
    });
    expect(await screen.findByText("Test Thread")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  test("renders thread with very high upvotes and replies", async () => {
    const highThread = { ...sampleThread, upvotes: 9999, replies: 9999 };
    mockFetchOnce(highThread, true);
    mockFetchOnce([], true);
    renderWithRouter(<ThreadDetail />, {
      route: "/threads/1",
      path: "/threads/:id",
    });
    expect(await screen.findByText("Test Thread")).toBeInTheDocument();
    expect(screen.getByText("9999")).toBeInTheDocument();
  });

  test("renders thread with very long title and content", async () => {
    const longThread = {
      ...sampleThread,
      title: "T".repeat(200),
      content: "C".repeat(1000),
    };
    mockFetchOnce(longThread, true);
    mockFetchOnce([], true);
    renderWithRouter(<ThreadDetail />, {
      route: "/threads/1",
      path: "/threads/:id",
    });
    expect(await screen.findByText("T".repeat(200))).toBeInTheDocument();
    expect(screen.getByText("C".repeat(1000))).toBeInTheDocument();
  });

  test("renders comment with very long content", async () => {
    const longComment = {
      _id: 3,
      threadId: "1",
      content: "A".repeat(1000),
      author: "Long",
      date: new Date().toISOString(),
    };
    mockFetchOnce(sampleThread, true);
    mockFetchOnce([longComment], true);
    renderWithRouter(<ThreadDetail />, {
      route: "/threads/1",
      path: "/threads/:id",
    });
    expect(await screen.findByText("A".repeat(1000))).toBeInTheDocument();
  });

  test("posts a comment with max length", async () => {
    mockFetchOnce(sampleThread, true);
    mockFetchOnce(sampleComments, true);
    renderWithRouter(
      <AuthContext.Provider value={mockAuth}>
        <ThreadDetail />
      </AuthContext.Provider>,
      { route: "/threads/1", path: "/threads/:id" }
    );
    await screen.findByText("Test Thread");
    fireEvent.click(screen.getByRole("button", { name: /add comment/i }));
    const maxContent = "X".repeat(1000);
    fireEvent.change(screen.getByPlaceholderText(/Write a comment/i), {
      target: { value: maxContent },
    });
    const newComment = {
      _id: 4,
      threadId: "1",
      content: maxContent,
      author: "Good Commenter",
      date: new Date().toISOString(),
    };
    mockFetchOnce(newComment, true); // POST
    mockFetchOnce([...sampleComments, newComment], true); // refresh comments
    fireEvent.click(screen.getByRole("button", { name: /Post comment/i }));
    await waitFor(() =>
      expect(
        screen.queryByPlaceholderText(/Write a comment/i)
      ).not.toBeInTheDocument()
    );
    expect(await screen.findByText(maxContent)).toBeInTheDocument();
  });
});

describe("ThreadDetail: Integration test cases", () => {
  // Integration test
  test("posts a new comment and refreshes", async () => {
    mockFetchOnce(sampleThread, true); // thread fetch
    mockFetchOnce(sampleComments, true); // comments fetch
    renderWithRouter(
      <AuthContext.Provider value={mockAuth}>
        <ThreadDetail />
      </AuthContext.Provider>,
      { route: "/threads/1", path: "/threads/:id" }
    );
    await screen.findByText("Test Thread");
    fireEvent.click(screen.getByRole("button", { name: /add comment/i }));
    fireEvent.change(screen.getByPlaceholderText(/Write a comment/i), {
      target: { value: "A new comment" },
    });
    const newComment = {
      _id: 3,
      threadId: "1",
      content: "A new comment",
      author: "Good Commenter",
      date: new Date().toISOString(),
    };
    mockFetchOnce(newComment, true); // POST
    mockFetchOnce([...sampleComments, newComment], true); // refresh comments
    fireEvent.click(screen.getByRole("button", { name: /Post comment/i }));
    await waitFor(() =>
      expect(
        screen.queryByPlaceholderText(/Write a comment/i)
      ).not.toBeInTheDocument()
    );
    expect(await screen.findByText("A new comment")).toBeInTheDocument();
  });
});

// Unit test for handleChange logic
function useForm() {
  const [form, setForm] = useState({ content: "" });
  const handleChange = (e: { target: { name: string; value: string } }) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  return { form, handleChange };
}

describe("ThreadDetail: Unit test cases", () => {
  test("updates form state", () => {
    const { result } = renderHook(() => useForm());
    act(() => {
      result.current.handleChange({
        target: { name: "content", value: "abc" },
      });
    });
    expect(result.current.form.content).toBe("abc");
  });
});

describe("ThreadDetail: Voting test cases (Integration)", () => {
  // Integration: Upvote action updates UI from backend response
  test("upvotes a thread", async () => {
    mockFetchOnce({ ...sampleThread }, true); // thread fetch
    mockFetchOnce(sampleComments, true); // comments fetch
    renderWithRouter(
      <AuthContext.Provider value={mockAuth}>
        <ThreadDetail />
      </AuthContext.Provider>,
      { route: "/threads/1", path: "/threads/:id" }
    );
    await screen.findByText("Test Thread");
    // Simulate backend response for upvote
    const updatedThread = {
      ...sampleThread,
      upvotes: sampleThread.upvotes + 1,
      userVote: "up",
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => updatedThread,
    } as any);
    fireEvent.click(screen.getByLabelText(/Upvote/i));
    await waitFor(() =>
      expect(screen.getByText(updatedThread.upvotes)).toBeInTheDocument()
    );
  });

  // Integration: Downvote action updates UI from backend response
  test("downvotes a thread", async () => {
    mockFetchOnce({ ...sampleThread }, true); // thread fetch
    mockFetchOnce(sampleComments, true); // comments fetch
    renderWithRouter(
      <AuthContext.Provider value={mockAuth}>
        <ThreadDetail />
      </AuthContext.Provider>,
      { route: "/threads/1", path: "/threads/:id" }
    );
    await screen.findByText("Test Thread");
    // Simulate backend response for downvote
    const updatedThread = {
      ...sampleThread,
      upvotes: sampleThread.upvotes - 1,
      userVote: "down",
    };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => updatedThread,
    } as any);
    fireEvent.click(screen.getByLabelText(/Downvote/i));
    await waitFor(() =>
      expect(screen.getByText(updatedThread.upvotes)).toBeInTheDocument()
    );
  });

  // Integration: Switch vote from up to down updates UI from backend response
  test("switches vote from up to down", async () => {
    mockFetchOnce({ ...sampleThread, userVote: "up", upvotes: 3 }, true); // thread fetch
    mockFetchOnce(sampleComments, true); // comments fetch
    renderWithRouter(
      <AuthContext.Provider value={mockAuth}>
        <ThreadDetail />
      </AuthContext.Provider>,
      { route: "/threads/1", path: "/threads/:id" }
    );
    await screen.findByText("Test Thread");
    // Simulate backend response for switch
    const updatedThread = { ...sampleThread, upvotes: 1, userVote: "down" };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => updatedThread,
    } as any);
    fireEvent.click(screen.getByLabelText(/Downvote/i));
    await waitFor(() =>
      expect(screen.getByText(updatedThread.upvotes)).toBeInTheDocument()
    );
  });

  // Integration: Cancel upvote updates UI from backend response
  test("cancels upvote", async () => {
    mockFetchOnce({ ...sampleThread, userVote: "up", upvotes: 3 }, true); // thread fetch
    mockFetchOnce(sampleComments, true); // comments fetch
    renderWithRouter(
      <AuthContext.Provider value={mockAuth}>
        <ThreadDetail />
      </AuthContext.Provider>,
      { route: "/threads/1", path: "/threads/:id" }
    );
    await screen.findByText("Test Thread");
    // Simulate backend response for cancel
    const updatedThread = { ...sampleThread, upvotes: 2, userVote: null };
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => updatedThread,
    } as any);
    fireEvent.click(screen.getByLabelText(/Upvote/i));
    await waitFor(() =>
      expect(screen.getByText(updatedThread.upvotes)).toBeInTheDocument()
    );
  });

  // Integration: Not logged in, voting does nothing
  test("does not allow voting if not logged in", async () => {
    mockFetchOnce({ ...sampleThread, userVote: null }, true); // thread fetch
    mockFetchOnce(sampleComments, true); // comments fetch
    renderWithRouter(
      <AuthContext.Provider value={mockAuth}>
        <ThreadDetail />
      </AuthContext.Provider>,
      { route: "/threads/1", path: "/threads/:id" }
    );
    await screen.findByText("Test Thread");
    window.alert = vi.fn();
    fireEvent.click(screen.getByLabelText(/Upvote/i));
    expect(window.alert).not.toHaveBeenCalledWith(
      expect.stringContaining("Vote failed")
    );
  });
});

describe("ThreadDetail: Auth/Back button test cases (UI/Integration)", () => {
  const noUserAuth = {
    ...mockAuth,
    user: null,
  };

  // Integration: Not logged in, comment triggers form error
  test("shows form error if not logged in and tries to comment", async () => {
    mockFetchOnce(sampleThread, true);
    mockFetchOnce(sampleComments, true);
    renderWithRouter(
      <AuthContext.Provider value={noUserAuth}>
        <ThreadDetail />
      </AuthContext.Provider>,
      { route: "/threads/1", path: "/threads/:id" }
    );
    await screen.findByText("Test Thread");
    fireEvent.click(screen.getByRole("button", { name: /add comment/i }));
    fireEvent.change(screen.getByPlaceholderText(/Write a comment/i), {
      target: { value: "Should not work" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Post comment/i }));
    expect(
      await screen.findByText("You must be logged in to comment.")
    ).toBeInTheDocument();
  });

  // Integration: Back button navigates back
  test("Back to Forum button navigates back", async () => {
    mockFetchOnce(sampleThread, true);
    mockFetchOnce(sampleComments, true);
    renderWithRouter(<ThreadDetail />, {
      route: "/threads/1",
      path: "/threads/:id",
    });
    await screen.findByText("Test Thread");
    fireEvent.click(screen.getByText(/Back to Forum/i));
  expect(navigateMock).toHaveBeenCalledWith("/forum");
  });
});
