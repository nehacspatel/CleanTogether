import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import axios from "axios";

function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const onSubmit = async (data) => {
    const userInfo = {
      userEmail: data.userEmail,
      userPassword: data.userPassword,
    };

    try {
      const res = await axios.post("http://localhost:5000/api/users/login", userInfo);

      if (res.data) {
        toast.success("Logged in Successfully");
        localStorage.setItem("users", JSON.stringify(res.data.user));
        setTimeout(() => navigate("/UserDashboard"), 1000);
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        switch (err.response.status) {
          case 400:
            toast.error("Invalid input. Check your fields.");
            break;
          case 401:
            toast.error("Incorrect email or password.");
            break;
          case 500:
            toast.error("Server error. Try again later.");
            break;
          default:
            toast.error("Unexpected error occurred.");
        }
      } else {
        toast.error("No server response. Check your connection.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h3 className="text-2xl font-semibold text-center text-indigo-600 mb-6">Login</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              {...register("userEmail", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email format",
                },
              })}
            />
            {errors.userEmail && (
              <p className="text-sm text-red-500 mt-1">{errors.userEmail.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              {...register("userPassword", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.userPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.userPassword.message}</p>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Login
          </button>

          {/* Signup Link */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Not registered?{" "}
            <Link to="/signup" className="text-indigo-600 hover:underline">
              Signup
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
