# Technical Debt Strategy

## _Including quality check_

We have used and continue to use SonarQube with the Automatic analysis method
on our GitHub repository, so that each time one of us pushed changes it is possible to see almost in real-time if the code is clear.

## _Priority_

Our main priority was to ensure that our code passed the quality gate successfully.

After that, we focused on solving issues both in the client and server sides, prioritising 'high severity' issues first, and then moving on to medium and low-severity ones.

The goal we set ourselves and achieved was to have a rating of A in all measures.

## _Workflow_

We made no distinction between the types of issue (security, reliability and maintanability), ensuring only that the percentage of duplicated lines was under 3%.
However it is no possible to solve all the issues but we think we made a good job.

## _Internal Organization_

Every member of the group has contributed on the improvement of the code.
Those who worked mainly in the backend focused on improving the code in the Server folder, and the same reasoning applies to those who worked mainly in the frontend.
Sometimes we used a separate branch in order to avoid conflits.
