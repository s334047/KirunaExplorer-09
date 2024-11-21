TEMPLATE FOR RETROSPECTIVE (Team ##)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done 
- Total points committed vs. done 
- Nr of hours planned vs. spent (as a team)

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |         |       |            |              |
| n      |         |        |            |              |
   

> story `#0` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)
- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated
  - Total hours spent
  - Nr of automated unit test cases 
  - Coverage (if available)
- E2E testing:
  - Total hours estimated
  - Total hours spent
- Code review 
  - Total hours estimated 
  - Total hours spent
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
  1. In the story n. 8, we estimated a task for server implementation, but after we decide to implement the search on the client side
  2. We estimated time for story n.9, but it was already imoplemented in the sprint 1

- What lessons did you learn (both positive and negative) in this sprint?
  1. We need to test more, especially E2E testing
  2. We learn that we have to remember to check updates on telegram by stakeholder

- Which improvement goals set in the previous retrospective were you able to achieve? 
  1. We paid attention more on the goal of each story, without losing the point
  2. We had more clear communication with team members 

- Which ones you were not able to achieve? Why?
  We had only one goal from the previous retrospective and we achieved it; and we also achieved an improvement goal of the project about the Queue Management

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  1. We need to do more E2E testing in specific scenarios
  2. We need to refactor the Database

- One thing you are proud of as a Team!!
  1. We keep going as group and we achieve the goal of previous