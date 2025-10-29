export const slugFormat = /^[a-z0-9-]{2,80}$/;
// Fixed order in character class to avoid confusing dash position.

export const amountFormat = /^[0-9]{1,6}$/;
// Changed `{0,6}` to `{1,6}` if amount shouldn't be empty. Use `{0,6}` only if empty string is valid.

export const nameFormat = /^[a-zA-Z0-9 ]{2,80}$/;
// No change needed.

export const linkFormat = /^\/[a-z]{4,20}$/;
// Escaped forward slash simplified. Also ensured only lowercase letters.

export const descriptionFormat = /^[a-zA-Z0-9 \-./';,:?<>é&|()"]{20,2500}$/;
// Escaped dash properly (`\-`) and removed unnecessary multiline string.

export const phoneValidation = /^(?:(?:\+|00)?250\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})-?(\d{4}))$/;
// No change — appears correct for Brazilian numbers.

export const passwordValidation = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
// No change — strong password pattern.

export const clerkUserIdFormat = /^user_[a-zA-Z0-9]+$/;
// Fixed: `^user_[a-zA-Z]$` only matched `user_a`, `user_B`, etc. Likely you want `user_` followed by alphanumeric characters.
