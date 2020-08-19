## eLocate Ecan Widget
This is a customised variant of the standard eLocate widget developed by R Sheitlin [https://community.esri.com/docs/DOC-7046](https://community.esri.com/docs/DOC-7046).  It has been modified to support coordinate systems utilised in New Zealand, with additional functionality for handling NZ Standard Topo Map Sheet grid references as an input/output.

#### Changes made include:  

- Locate and address (like the search widget, but gives you the ability to limit the address search to the maps current extent).
- Locate coordinates using user defined spatial reference coordinates (i.e. DMS, State Plane, etc).
- Reverse Geocode capability called Address Inspection. Address Inspection is clicking on the map and getting the address of the map click point. 
- NZ Topo 50 Grid reference added as input or and output type
- NZMS260 Grid reference added as input or and output type

#### Notes
The following are changes that are still needed to be implemented:

- Requires option for calling on open of widget if it is closed
- Reset should apply default values from parameters again if they have been changed
- Developed in conjunction with the Edit Filter widget and should accept filter values from that widget or the standard Group Filter widget. 

#### Demo
To be deployed in the future


### Changes

**16 April 2019**

-  ** Upgraded to WAB 2.12 code.
