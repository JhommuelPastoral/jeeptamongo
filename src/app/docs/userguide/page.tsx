"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
export default function UserGuide() {
  const router = useRouter();

  return (
    <div className="w-full flex justify-center items-center bg-gray-50">
      <div className="max-w-2xl w-full h-full overflow-y-auto bg-white p-6 space-y-6">

        {/* Title */}
        <h1 className="text-2xl font-bold">How to Use the App</h1>

        {/* Step 1 */}
        <section>
          <h2 className="text-lg font-semibold">1. Enable Location</h2>
          <p className="text-sm text-gray-600">
            When you open the app, allow location access. This is required for the app to track your position.
          </p>

          <h3 className="text-md font-semibold mt-3">For Mobile:</h3>

          <div className="flex justify-center gap-3 mt-2 flex-col items-center">
            <Image
              src="/docs/step-1.png"
              alt="Step 1"
              width={400}
              height={400}
              className="w-full max-w-xs h-auto rounded-lg shadow"
              priority
            />
            <Image
              src="/docs/step-2.png"
              alt="Step 2"
              width={400}
              height={400}
              className="w-full max-w-xs h-auto rounded-lg shadow"
              priority
            />
            <Image
              src="/docs/step-3.png"
              alt="Step 3"
              width={400}
              height={400}
              className="w-full max-w-xs h-auto rounded-lg shadow"
              priority
            />
          </div>
        </section>

        {/* Step 2 */}
        <section>
          <h2 className="text-lg font-semibold">2. Wait for GPS</h2>
          <p className="text-sm text-gray-600">
            The app will load your current location. If it takes time, just wait — GPS can be slow depending on your signal.
          </p>
          <div className="mt-2 flex items-center justify-center">
            <Image
              src="/docs/step-4.png"
              alt="Step 1"
              width={400}
              height={400}
              className="w-full max-w-xs h-auto rounded-lg shadow"
              priority
            />          
          </div>
        </section>

        {/* Step 3 */}
        <section>
          <h2 className="text-lg font-semibold">3. View Your Location</h2>
          <p className="text-sm text-gray-600">
            Your position will appear on the map as a moving dot. Your latitude and longitude are shown on the screen.
          </p>
        </section>

        {/* Step 4 */}
        <section>
          <h2 className="text-lg font-semibold">4. Check Your Speed</h2>
          <p className="text-sm text-gray-600">
            Your current speed (km/h) is displayed at the top left. If you are not moving, it will show 0.
          </p>
        </section>

        {/* Step 5 */}
        <section>
          <h2 className="text-lg font-semibold">5. Center Map</h2>
          <p className="text-sm text-gray-600">
            Tap the <b>“Am I Lost?”</b> button to center the map back to your current position.
          </p>
        </section>

        {/* Step 6 */}
        <section>
          <h2 className="text-lg font-semibold">6. Change Theme</h2>
          <p className="text-sm text-gray-600">
            Tap your profile icon on the top right and switch between light and dark mode.
          </p>
        </section>

        {/* Notes */}
        <section>
          <h2 className="text-lg font-semibold">⚠️ Important Notes</h2>
          <ul className="list-disc ml-5 text-sm text-gray-600">
            <li>Slow or no movement (like traffic) is normal</li>
            <li>GPS may take time in weak signal areas</li>
            <li>Make sure location is turned ON on your device</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="pt-4 border-t text-xs text-gray-400 text-center gap-2 flex flex-col">
          <Button className="w-full cursor-pointer" onClick={()=> router.push('/dashboard')}>All Set?</Button>
          <p>
            Built for real-time GPS tracking
          </p>
        </div>

      </div>
    </div>
  );
}