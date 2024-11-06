#include <stdio.h>
#include <math.h>
#include <stdlib.h>

typedef enum {
	TOTAL_ESTIMATION_ERROR_RATIO = 1,
	ABSOLUTE_RELATIVE_TASK_ESTIMATION_ERROR,
	EXIT
} MenuOption;

static float convertiOrarioInFloat(const char* orario) {
	int ore, minuti;
	if (sscanf_s(orario, "%d:%d", &ore, &minuti) != 2) {
		printf("Error: Invalid time format. Use 'hours:minutes'.\n");
		return -1.0;
	}
	if (minuti < 0 || minuti > 59) {
		printf("Error: Minutes must be between 0 and 59.\n");
		return -1.0;
	}
	return (float)(ore + (minuti / 60.0));
}

static void totalEstimationErrorRatio(void) {
	int numTasks, i;
	float spent, estimation;
	float totalSpent = 0.0, totalEstimation = 0.0;
	char input[10];

	printf("Enter the number of tasks: ");
	if (scanf_s("%d", &numTasks) != 1) {
		printf("Error: Invalid input.\n");
		return;
	}
	for (i = 0; i < numTasks; i++) {
		printf("Enter hours spent for task %d (in hours:minutes format): ", i + 1);
		if (scanf_s("%9s", input, (unsigned)_countof(input)) != 1) {
			printf("Error: Invalid input.\n");
			return;
		}
		spent = convertiOrarioInFloat(input);
		if (spent < 0) return;

		printf("Enter estimated hours for task %d (in hours:minutes format): ", i + 1);
		if (scanf_s("%9s", input, (unsigned)_countof(input)) != 1) {
			printf("Error: Invalid input.\n");
			return;
		}
		estimation = convertiOrarioInFloat(input);
		if (estimation < 0) return;

		totalSpent += spent;
		totalEstimation += estimation;
	}
	if (totalEstimation != 0) {
		float errorRatio = (totalSpent / totalEstimation) - 1;
		printf("Total estimation error ratio: %.3f\n", errorRatio);
	}
	else {
		printf("Error: The sum of estimated hours is zero.\n");
	}
	return;
}

static void absoluteRelativeTaskEstimationError(void) {
	int numTasks, i;
	float spent, estimation;
	float totalError = 0.0f;
	char input[10];

	printf("Enter the number of tasks: ");
	if (scanf_s("%d", &numTasks) != 1) {
		printf("Error: Invalid input.\n");
		return;
	}
	for (i = 0; i < numTasks; i++) {
		printf("Enter hours spent for task %d (in hours:minutes format): ", i + 1);
		if (scanf_s("%9s", input, (unsigned)_countof(input)) != 1) {
			printf("Error: Invalid input.\n");
			return;
		}
		spent = convertiOrarioInFloat(input);
		if (spent < 0) return;

		printf("Enter estimated hours for task %d (in hours:minutes format): ", i + 1);
		if (scanf_s("%9s", input, (unsigned)_countof(input)) != 1) {
			printf("Error: Invalid input.\n");
			return;
		}
		estimation = convertiOrarioInFloat(input);
		if (estimation < 0) return;

		if (estimation != 0) {
			float taskError = (float)fabs((spent / estimation) - 1);
			totalError += taskError;
		}
		else {
			printf("Error: The estimate for task %d is zero. Ignored.\n", i + 1);
		}
	}
	if (numTasks > 0) {
		float averageError = totalError / numTasks;
		printf("Absolute relative task estimation error: %.3f\n", averageError);
	}
	else {
		printf("Error: No valid task.\n");
	}
	return;
}

int main() {
	MenuOption scelta;
	do {
		printf("\nSelect an operation:\n");
		printf("1. Calculate Total Estimation Error Ratio\n");
		printf("2. Calculate Absolute Relative Task Estimation Error\n");
		printf("3. Exit\n");
		printf("Choice: ");
		if (scanf_s("%d", (int*)&scelta) != 1) {
			printf("Error: Invalid input.\n");
			return 1;
		}

		switch (scelta) {
		case TOTAL_ESTIMATION_ERROR_RATIO:
			totalEstimationErrorRatio();
			break;
		case ABSOLUTE_RELATIVE_TASK_ESTIMATION_ERROR:
			absoluteRelativeTaskEstimationError();
			break;
		case EXIT:
			printf("Exiting the program.\n");
			break;
		default:
			printf("Invalid choice. Try again.\n");
		}
	} while (scelta != EXIT);

	return 0;
}
