# Component Guidelines

> How components are built in this project.

---

## Overview

This repository currently has no frontend components yet. These are the **bootstrap component conventions** for the React + TypeScript + Vite app.

The UI should remain task-focused and simple. Most components in the first version should exist to support one workflow:
1. choose a target portrait;
2. choose a folder of images;
3. set threshold and padding;
4. start processing;
5. inspect summary data and preview results.

Prefer small, readable components over abstract component systems.

---

## Component Structure

A component should usually contain:
1. typed props;
2. minimal derived values;
3. event handlers close to usage;
4. accessible JSX;
5. no embedded networking logic unless the component is the top-level feature container.

Bootstrap example:

```tsx
interface ProcessSummaryProps {
  totalImages: number
  matchedFaces: number
  status: string
}

export function ProcessSummary({ totalImages, matchedFaces, status }: ProcessSummaryProps) {
  return (
    <section>
      <h2>Result summary</h2>
      <p>Status: {status}</p>
      <p>Total images: {totalImages}</p>
      <p>Matched faces: {matchedFaces}</p>
    </section>
  )
}
```

Keep rendering components mostly declarative. Move request orchestration and file packaging into hooks or feature-level modules.

---

## Props Conventions

- Always define explicit props interfaces or type aliases.
- Prefer narrow props over passing large objects when only a few fields are used.
- Pass callbacks for user actions instead of letting child components know API details.
- Keep optional props rare and meaningful.
- Do not use `any` for event handlers or API data.

Good examples:
- `onSubmit(files, options)` from a form component;
- `results: CropResultItem[]` for a preview list;
- `disabled: boolean` for submit state.

Avoid:
- prop drilling raw `FormData` objects through multiple layers;
- giant `data` props with unrelated fields;
- boolean prop piles when a small discriminated union would be clearer.

---

## Styling Patterns

The styling approach is not chosen yet, so keep the rule simple:
- use the lightest styling option that works with Vite and keeps the UI readable;
- prefer plain CSS or CSS modules first;
- avoid introducing a heavy design system before the app has stable UI needs.

Styling priorities:
1. clear layout for input, action, and result sections;
2. readable status messages;
3. obvious loading and disabled states;
4. thumbnail previews that do not distort aspect ratio.

Do not block implementation on perfect visual polish.

---

## Accessibility

Minimum accessibility requirements for the first version:
- Every file input must have a visible label.
- Buttons must have clear action text.
- Preview images must include meaningful `alt` text using source filenames when possible.
- Status changes should be visible in text, not only color.
- Form controls must stay keyboard-usable.

Because this app handles file selection and result review, usability matters more than fancy UI patterns.

---

## Common Mistakes To Avoid

- Combining upload UI, request creation, and results rendering in one huge component.
- Hiding critical processing status inside toast-only feedback.
- Building a generic form framework for a single screen.
- Creating reusable modal, table, or card systems before multiple real use cases exist.
- Making result preview components responsible for business rules such as threshold comparisons.
