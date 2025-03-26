declare module 'tailwindcss' {
  export interface Config {
    content: string[];
    theme: any;
    plugins: any[];
    [key: string]: any;
  }
  const tailwindcss: any;
  export default tailwindcss;
} 