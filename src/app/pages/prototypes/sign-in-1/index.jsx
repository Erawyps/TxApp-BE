// Import Dependencies
import { Link } from "react-router";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";

// Local Imports
import Logo from "assets/appLogo.svg?react";
import { Button, Card, Checkbox, Input } from "components/ui";

// ----------------------------------------------------------------------

export default function SignInV1() {
  return (
    <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
      <div className="w-full max-w-[26rem] p-4 sm:px-5">
        <div className="text-center">
          <Logo className="mx-auto size-16" />
          <div className="mt-4">
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
              Welcome Back
            </h2>
            <p className="text-gray-400 dark:text-dark-300">
              Please sign in to continue
            </p>
          </div>
        </div>
        <Card className="mt-5 rounded-lg p-5 lg:p-7">
          <form>
            <div className="space-y-4">
              <Input
                label="Username"
                placeholder="Enter Username"
                prefix={
                  <EnvelopeIcon
                    className="size-5 transition-colors duration-200"
                    strokeWidth="1"
                  />
                }
              />
              <Input
                label="Password"
                placeholder="Enter Password"
                type="password"
                prefix={
                  <LockClosedIcon
                    className="size-5 transition-colors duration-200"
                    strokeWidth="1"
                  />
                }
              />

              <div className="flex items-center justify-between space-x-2">
                <Checkbox label="Remember me" />
                <a
                  href="##"
                  className="text-xs text-gray-400 transition-colors hover:text-gray-800 focus:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100 dark:focus:text-dark-100"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            <Button className="mt-5 w-full" color="primary">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-xs-plus">
            <p className="line-clamp-1">
              <span>Dont have Account?</span>{" "}
              <Link
                className="text-primary-600 transition-colors hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600"
                to="/pages/sign-up-v1"
              >
                Create account
              </Link>
            </p>
          </div>
          <div className="my-7 flex items-center space-x-3 text-xs ">
            <div className="h-px flex-1 bg-gray-200 dark:bg-dark-500"></div>
            <p>OR</p>
            <div className="h-px flex-1 bg-gray-200 dark:bg-dark-500"></div>
          </div>
          <div className="flex gap-4">
            <Button className="h-10 flex-1 gap-3" variant="outlined">
              <img
                className="size-5.5"
                src="/images/logos/google.svg"
                alt="logo"
              />
              <span>Google</span>
            </Button>
            <Button className="h-10 flex-1 gap-3" variant="outlined">
              <img
                className="size-5.5"
                src="/images/logos/github.svg"
                alt="logo"
              />
              <span>Github</span>
            </Button>
          </div>
        </Card>
        <div className="mt-8 flex justify-center text-xs text-gray-400 dark:text-dark-300">
          <a href="##">Privacy Notice</a>
          <div className="mx-2.5 my-0.5 w-px bg-gray-200 dark:bg-dark-500"></div>
          <a href="##">Term of service</a>
        </div>
      </div>
    </main>
  );
}
