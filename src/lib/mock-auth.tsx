export type UserRole = "producer" | "consumer";

export type MockUser = {
  role: UserRole; // producer | consumer
  username: string;
  password: string;

  orgName: string;
  city: string;
  state: string;
  address: string;

  // Only for consumers
  consumerType?: string;
};

const USER_KEY = "hydrosync:user";
const AUTH_KEY = "hydrosync:authed";

export function signupMock(user: MockUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_KEY, "true");
}

export function loginMock(username: string, password: string) {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return { ok: false, error: "No account found. Please sign up." };

  const user = JSON.parse(raw) as MockUser;

  if (user.username !== username || user.password !== password) {
    return { ok: false, error: "Invalid username or password." };
  }

  localStorage.setItem(AUTH_KEY, "true");
  return { ok: true };
}

export function logoutMock() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthedMock() {
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function getMockUser(): MockUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as MockUser;
}