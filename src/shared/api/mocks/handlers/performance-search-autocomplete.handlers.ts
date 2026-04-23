import { HttpResponse, http } from "msw";
import type { PerformanceAutocompleteResponse } from "../../orval/types";

const mockAutocompleteData: PerformanceAutocompleteResponse[] = [];

/**
 * 검색 자동완성 조회
 * GET /api/performances/search/autocomplete
 */
export const getAutocompleteHandler = http.get(
	"/api/performances/search/autocomplete",
	() => {
		return HttpResponse.json(mockAutocompleteData);
	},
);
