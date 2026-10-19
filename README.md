# Plinth Plan Pros

Update my existing AI-Based Construction Cost Prediction website.



STRICT REQUIREMENT:

Use the PLINTH AREA METHOD as the primary and only construction

cost estimation method.



Do not implement the Item Rate Method or detailed material

quantity calculations.



1. ESTIMATION FORMULA



Estimated Construction Cost =

Total Plinth Area × Applicable Rate per Square Foot



If the entered area is per floor:

Total Plinth Area = Area per Floor × Number of Floors



If the entered area is already the total plinth area:

Use that area directly without multiplying again.



2. USER INPUTS



Include:

- Building type

- Area measurement mode

- Plinth area in square feet

- Number of floors

- Construction quality: Poor, Standard, High

- Location category: Metropolitan, Urban, Semi-Urban, Rural

- State

- City or town



3. CONSTRUCTION RATES



Select an appropriate rate based on building type, quality and

location using the existing project dataset or validated rates.



Do not invent market rates.



If the required rate is unavailable, clearly request the missing

data rather than displaying a fabricated estimate.



4. COST BREAKDOWN PAGE



Create a separate Cost Breakdown page.



Show estimated cost allocations for:

- Materials

- Labour

- Equipment and transportation

- Other included expenses



These are cost allocations, not individual material quantity

calculations.



Use the existing dataset or a documented allocation method.

Do not invent unsupported percentages.



Ensure all category allocations add up exactly to the estimated

construction cost.



5. LOCATION ANALYSIS



Support:

- Metropolitan cities

- Urban areas

- Semi-urban areas

- Rural areas



Use validated location-specific construction rates when available.



Avoid applying a location adjustment twice if the selected rate

or prediction already accounts for location.



6. DASHBOARD



Display:

- Total plinth area

- Applicable rate per square foot

- Estimated total construction cost

- Estimated cost per square foot

- Selected construction quality

- Selected location

- Cost allocation chart



7. PDF REPORT



Generate a professional report containing project details,

plinth area, applicable rate, estimation formula, total cost,

cost allocations, assumptions and exclusions.



8. DESIGN



Preserve the existing website features.



Use a premium navy-blue architectural theme with subtle animated

blueprint grids, gold and cyan accents, elegant cards, responsive

layouts and smooth animations.



Respect reduced-motion preferences.



9. VALIDATION



Ensure:

- All pages use the same calculation source.

- Changing the plinth area updates the estimate.

- Changing the number of floors works correctly.

- The grand total matches the cost allocations.

- Cost per square foot is calculated correctly.

- PDF values match the dashboard.

- Existing functionality is preserved.



Do not replace an existing trained ML model without inspection.

If the project uses only a fixed rate and area formula, describe

it as a Plinth Area cost calculator rather than claiming that it

uses an actual trained ML prediction model.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://plinth-plan-pros.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d7e15ea0-cca9-4d2b-a88c-94463f105031).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
