export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans TC"', '"Microsoft JhengHei"', "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        accent: ['"LXGW WenKai TC"', '"Noto Sans TC"', '"Microsoft JhengHei"', "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 60px rgba(31, 41, 55, 0.10)"
      }
    }
  },
  plugins: []
};
