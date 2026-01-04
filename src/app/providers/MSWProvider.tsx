"use client";

import { useEffect, useState } from "react";

/**
 * MSW Provider 컴포넌트
 * 개발 환경에서만 MSW를 초기화하고 활성화합니다
 */
export function MSWProvider({ children }: { children: React.ReactNode }) {
	const [mswReady, setMswReady] = useState(
		() => process.env.NODE_ENV !== "development",
	);

	useEffect(() => {
		/**
		 * 개발 환경에서 MSW 활성화
		 */
		async function initMsw() {
			if (process.env.NODE_ENV === "development") {
				const { worker } = await import("@/shared/api/mocks/browser");
				await worker.start({
					onUnhandledRequest: "bypass",
				});
				setMswReady(true);
			}
		}

		initMsw();
	}, []);

	if (!mswReady) {
		return null;
	}

	return <>{children}</>;
}
