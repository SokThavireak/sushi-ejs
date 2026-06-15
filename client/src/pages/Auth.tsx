import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as THREE from "three";
import axios from "axios";

export const Auth: React.FC = () => {
  const { login, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const API_BASE = import.meta.env.VITE_API_URL || "";

  // Three.js background effect
  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const vertexShader = `
      uniform float time;
      uniform float intensity;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        
        vec3 pos = position;
        pos.y += sin(pos.x * 10.0 + time) * 0.1 * intensity;
        pos.x += cos(pos.y * 8.0 + time * 1.5) * 0.05 * intensity;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float time;
      uniform float intensity;
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vec2 uv = vUv;
        
        float noise = sin(uv.x * 20.0 + time) * cos(uv.y * 15.0 + time * 0.8);
        noise += sin(uv.x * 35.0 - time * 2.0) * cos(uv.y * 25.0 + time * 1.2) * 0.5;
        
        vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
        color = mix(color, vec3(1.0, 1.0, 1.0), pow(abs(noise), 2.0) * intensity * 0.7);
        
        float glow = 1.0 - length(uv - 0.5) * 1.5;
        glow = clamp(glow, 0.0, 1.0);
        glow = pow(glow, 1.5);
        
        gl_FragColor = vec4(color * glow, glow);
      }
    `;

    const uniforms = {
      time: { value: 0 },
      intensity: { value: 1.0 },
      color1: { value: new THREE.Color("#ffffff") },
      color2: { value: new THREE.Color("#f97316") },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      uniforms.time.value = elapsedTime;
      uniforms.intensity.value = 1.0 + Math.sin(elapsedTime * 2) * 0.3;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
    };
  }, []);

  const handleAuth = async (e: React.FormEvent, endpoint: string) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (endpoint === "/login") {
        const res = await login(email, password);
        if (res.success) {
          setSuccessMsg("Login Successful!");
          setTimeout(() => {
            const role = res.role?.trim().toLowerCase();
            if (role === "staff") navigate("/staff/menu");
            else if (["admin", "manager", "store_manager"].includes(role || "")) navigate("/admin/dashboard");
            else navigate("/");
          }, 1000);
        } else {
          setErrorMsg(res.error || "Login failed");
        }
      } else {
        // Register
        const res = await axios.post(`${API_BASE}/register`, {
          username: email,
          password,
        });
        setSuccessMsg(res.data.message || "Registration Successful!");
        await checkAuth();
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || "Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 flex justify-center items-center flex-col font-sans h-screen w-screen px-4 relative overflow-hidden">
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full hover:bg-white/25 transition duration-300 shadow-lg font-semibold text-sm"
      >
        <i className="fa-solid fa-arrow-left"></i> Back to Home
      </Link>

      {/* Notification Toast */}
      {(errorMsg || successMsg) && (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
          <div
            className={`${
              errorMsg ? "bg-red-500" : "bg-green-500"
            } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-white/20`}
            style={{ animation: "slideIn 0.5s forwards" }}
          >
            <div className="text-2xl">
              <i
                className={`fa-solid ${
                  errorMsg ? "fa-circle-exclamation" : "fa-circle-check"
                }`}
              ></i>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm uppercase tracking-wide opacity-80">
                {errorMsg ? "Error" : "Success"}
              </span>
              <span className="font-bold text-base">{errorMsg || successMsg}</span>
            </div>
          </div>
        </div>
      )}

      {/* Auth Container */}
      <div
        className={`bg-white rounded-[20px] shadow-2xl relative z-10 w-[768px] max-w-full min-h-[480px] overflow-hidden transition-all duration-600 ${
          isSignUp ? "right-panel-active" : ""
        }`}
        id="container"
      >
        {/* Sign Up Panel */}
        <div
          className={`absolute top-0 h-full transition-all duration-600 left-0 w-full md:w-1/2 ${
            isSignUp
              ? "opacity-100 z-5 translate-x-0 md:translate-x-full"
              : "opacity-0 z-1 pointer-events-none md:translate-x-0"
          }`}
        >
          <form
            onSubmit={(e) => handleAuth(e, "/register")}
            className="bg-white flex flex-col items-center justify-center h-full px-8 md:px-12 text-center"
          >
            <h1 className="font-bold text-3xl mb-4">Create Account</h1>

            <div className="flex gap-4 mb-4">
              <a
                href={`${API_BASE}/auth/google`}
                className="border border-gray-200 rounded-full w-10 h-10 flex justify-center items-center hover:bg-orange-50 hover:border-orange-500 hover:text-orange-500 transition duration-300"
              >
                <i className="fab fa-google text-sm"></i>
              </a>
            </div>

            <span className="text-xs text-gray-500 mb-4">
              or use your email for registration
            </span>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="bg-gray-100 border-none px-4 py-3 mb-2 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="bg-gray-100 border-none px-4 py-3 mb-4 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-full border border-orange-500 bg-orange-500 text-white text-xs font-bold py-3 px-10 uppercase tracking-wider transition transform hover:bg-orange-600 hover:scale-105 active:scale-95 focus:outline-none"
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>

            <p className="md:hidden mt-6 text-sm text-gray-500">
              Already have an account?{" "}
              <a
                onClick={() => setIsSignUp(false)}
                className="text-orange-500 font-bold cursor-pointer"
              >
                Sign In
              </a>
            </p>
          </form>
        </div>

        {/* Sign In Panel */}
        <div
          className={`absolute top-0 h-full transition-all duration-600 left-0 w-full md:w-1/2 ${
            isSignUp
              ? "opacity-0 z-1 pointer-events-none md:translate-x-full"
              : "opacity-100 z-5 translate-x-0"
          }`}
        >
          <form
            onSubmit={(e) => handleAuth(e, "/login")}
            className="bg-white flex flex-col items-center justify-center h-full px-8 md:px-12 text-center"
          >
            <h1 className="font-bold text-3xl mb-4">Sign in</h1>

            <div className="flex gap-4 mb-4">
              <a
                href={`${API_BASE}/auth/google`}
                className="border border-gray-200 rounded-full w-10 h-10 flex justify-center items-center hover:bg-orange-50 hover:border-orange-500 hover:text-orange-500 transition duration-300"
              >
                <i className="fab fa-google text-sm"></i>
              </a>
            </div>

            <span className="text-xs text-gray-500 mb-4">or use your account</span>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="bg-gray-100 border-none px-4 py-3 mb-2 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="bg-gray-100 border-none px-4 py-3 mb-2 w-full rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <a href="#" className="text-xs text-gray-400 mb-4 hover:text-orange-500 transition">
              Forgot your password?
            </a>

            <button
              type="submit"
              disabled={loading}
              className="rounded-full border border-orange-500 bg-orange-500 text-white text-xs font-bold py-3 px-10 uppercase tracking-wider transition transform hover:bg-orange-600 hover:scale-105 active:scale-95 focus:outline-none"
            >
              {loading ? "Processing..." : "Sign In"}
            </button>

            <p className="md:hidden mt-6 text-sm text-gray-500">
              Don't have an account?{" "}
              <a
                onClick={() => setIsSignUp(true)}
                className="text-orange-500 font-bold cursor-pointer"
              >
                Sign Up
              </a>
            </p>
          </form>
        </div>

        {/* Sliding overlay panel for desktop screens */}
        <div className="hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 z-[100] overlay-container">
          <div
            className="bg-gradient-to-r from-orange-600 to-orange-500 text-white relative h-full w-[200%] -left-full transform transition-transform duration-600"
            style={{
              transform: isSignUp ? "translateX(50%)" : "translateX(0)",
            }}
          >
            {/* Left Overlay (Welcome Back) */}
            <div
              className="absolute flex items-center justify-center flex-col p-10 text-center top-0 h-full w-1/2 transition-transform duration-600"
              style={{
                transform: isSignUp ? "translateX(0)" : "translateX(-20%)",
              }}
            >
              <h1 className="font-bold text-3xl mb-4">Welcome Back!</h1>
              <p className="text-sm font-thin leading-5 mb-8">
                To keep connected with us please login with your personal info
              </p>
              <button
                onClick={() => setIsSignUp(false)}
                className="bg-transparent border border-white text-white rounded-full text-xs font-bold py-3 px-10 uppercase tracking-wider transition transform hover:bg-white hover:text-black focus:outline-none"
              >
                Sign In
              </button>
            </div>

            {/* Right Overlay (Hello Friend) */}
            <div
              className="absolute flex items-center justify-center flex-col p-10 text-center top-0 h-full w-1/2 right-0 transition-transform duration-600"
              style={{
                transform: isSignUp ? "translateX(20%)" : "translateX(0)",
              }}
            >
              <h1 className="font-bold text-3xl mb-4">Hello, Friend!</h1>
              <p className="text-sm font-thin leading-5 mb-8">
                Enter your personal details and start your journey with Us
              </p>
              <button
                onClick={() => setIsSignUp(true)}
                className="bg-transparent border border-white text-white rounded-full text-xs font-bold py-3 px-10 uppercase tracking-wider transition transform hover:bg-white hover:text-black focus:outline-none"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive adjustments styles */}
      <style>{`
        .right-panel-active .overlay-container {
          transform: translateX(-100%);
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
