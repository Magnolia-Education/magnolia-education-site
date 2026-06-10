A round avatar — a photo when `src` is set, otherwise the person's initials on a soft coral ground.

```jsx
<Avatar name="Rachit Chakerwarti" size={44} />
<Avatar name="Gladys Lou" src="assets/headshots/gladys-lou.jpg" size={56} />
```

- Initials are derived from the first two words of `name`.
- Photos use `object-position: center top` so headshots frame faces.
