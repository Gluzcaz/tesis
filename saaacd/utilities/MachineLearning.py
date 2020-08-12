import numpy as np
import cv2 as cv
from saaacd.submodels.RegionGeografica import RegionGeografica


class MachineLearning():
    @staticmethod
    def getRegionCoordinates(imageName):
        print(imageName);
        regions = []
        im = cv.imread(imageName)
        rotated=cv.transpose(im)
        rotated=cv.flip(rotated,flipCode=-1)
        rotated = cv.rotate(rotated, cv.ROTATE_90_CLOCKWISE)
		#cv.imwrite(rotatedImage, rotated);

        gray = cv.cvtColor(rotated, cv.COLOR_BGR2GRAY)
		###cv.imwrite(blancoNegro, gray);

		# Aplicar suavizado Gaussiano
		#gaussiana = cv.GaussianBlur(gray, (5,5), 0)
        gaussiana = cv.GaussianBlur(gray, (7, 7), 3)

        thresh = cv.adaptiveThreshold(gaussiana,255,cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY,11,2)
		###cv.imwrite(result, thresh);

		##Provisional en lo que encuentro como cerrar figuras-----------------------------
        gaussiana = cv.GaussianBlur(thresh, (7, 7), 3)
        thresh = cv.adaptiveThreshold(gaussiana,255,cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY,11,2)
		#--------------------------------------------------
		###cv.imwrite(result, thresh);

		# Find Canny edges 
        edged = cv.Canny(thresh, 50, 200)#50, 150  30  200
		###cv.imwrite(resultCanny, edged);

		# [-2:] is s trick to be compatible both with opencv 2 and 3
        (contours, hierarchy) = cv.findContours(edged, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
        print("He encontrado {} figuras".format(len(contours)))
        print("He encontrado {} contornos".format(len(hierarchy)))

		# filling pixels inside the polygon defined by "vertices" with the fill color
		#gt = np.zeros_like(im[:, :, 0])

        contoursTotal = len(contours)
        regionNumber=0

        def saveContour(index, item):
            #Centroids
            lenghtPoints = len(contours[index])
            sumCentroidX =0
            sumCentroidY =0
            feautureString = '[['
            for j in range(lenghtPoints):
                  feautureString += '[{},{}],'.format(contours[index][j][0][0], contours[index][j][0][1])
                  sumCentroidX += contours[index][j][0][0]
                  sumCentroidY += contours[index][j][0][1]
            centroidX = sumCentroidX//lenghtPoints
            centroidY = sumCentroidY//lenghtPoints
            item.centroide = '[{},{}]'.format(centroidX, centroidY)
            item.coordenada = feautureString + ']]';
			
        for i in range(contoursTotal):
                if hierarchy[0, i, 3] == -1:    #No parent: this is the outer contour which we need to draw
                    region = RegionGeografica()
                    regionNumber += 1
                    region.id = regionNumber
                    saveContour(i, region)
                    regions.append(region)
					#cv.drawContours(gt, contours, i, (255,255,255), 5)
                if hierarchy[0, i, 2] != -1:    #children: if this contour has inner contours
                    childrenIndex = hierarchy[0, i, 2] #the index of the first child
                    while hierarchy[0, childrenIndex, 0] != -1:  #while there is next child, get all children for the outer contour
                        childrenIndex = hierarchy[0, childrenIndex, 0]
                        # now the first inner contour is just near the outer one (from the opposite side of the line)
                        # thats why we are drawing that inner contour's children
                        if hierarchy[0, childrenIndex, 2] != -1:
                                area = cv.contourArea(contours[childrenIndex])
                                if area > 200: #PENDIENTE
                                    regionNumber += 1
                                    childRegion = RegionGeografica();
                                    childRegion.id=regionNumber;
                                    saveContour(childrenIndex, childRegion)
                                    regions.append(childRegion);
									#cv.drawContours(gt, contours, hierarchy[0, childrenIndex, 2], (255,255,255), 5)
        #print(regions);
        return regions;

	#f = open (fileName,'w')
	#f.write( f_str)
	#f.close()

	#masked_image = cv.bitwise_not( gt) 
	#cv.imwrite(fillResult, masked_image);

