# TEMPLATE FOR RETROSPECTIVE (Team 09)

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed: 4 vs done: 4
- Total points committed: 42 vs done: 42
- Nr of hours planned: 78 vs spent: 79.33 (as a team)

**Remember** a story is done ONLY if it fits the Definition of Done:

- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
| :---: | :-----: | :----: | :--------: | :----------: |
| _#0_  |    7    |   -    |     62     |    62.33     |
| KX19  |    1    |   6    |     3      |      3       |
| KX10  |    2    |   16   |     5      |      6       |
| KX20  |    1    |   10   |     5      |     4.75     |
| KX14  |    1    |   10   |     3      |     3.25     |

- Hours per task average: 6.5 (estimate), 6.61 (actual)
- Standard deviation: 4.72 (estimate), 4.59 (actual)
- Total task estimation error ratio: 0.017

## QUALITY MEASURES

- Unit Testing:
  - Total hours estimated: 0
  - Total hours spent: 0
  - Nr of automated unit test cases: 82
  - Coverage: 70%
- E2E testing:
  - Total hours estimated: 8
  - Total hours spent: 9
- Code review
  - Total hours estimated: 6
  - Total hours spent: 6
- Technical Debt management:
  - [Technical Strategy](../TD_stategy.md) adopted
  - Total hours estimated estimated at sprint planning: 15
  - Total hours spent: 14.33

## ASSESSMENT

- What caused your errors in estimation (if any)?

1. We overestimated TD managmenet because we based our estimation on the our written on SonarCloud
2. We underestimated a little E2E testing because we thought we would spend more time on TD management

- What lessons did you learn (both positive and negative) in this sprint?

1. We learn that by doing a lot of E2E testing we could recognise lots of errors
2. We learned that we have to check every little thing properly, in every task, before proceeding with the next tasks

- Which improvement goals set in the previous retrospective were you able to achieve?

1. We permorfed more E2E testing than the previous sprint
2. We made a homogeneous and consistent database

- Which ones you were not able to achieve? Why?

1. We achieved all our previous goals

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

1. Checking everything before proceeding, so we don't have to come back to previous things
2. Pay attention to work in progress modifications, especially on telegram, to avoid last minute changes.
3. Pay attention on coordinations' crucial points, just to be prepared and avoid problems before they will appear.

- One thing you are proud of as a Team!!

1. We are proud of how many stories we are doing even if we are only a group of 5 people
2. Despite some difficulties that we had in the first two sprints of this course, we managed to overcome them.  
Right now we are almost in a stressless environment, comunicating really well and performing good activity workflow.
